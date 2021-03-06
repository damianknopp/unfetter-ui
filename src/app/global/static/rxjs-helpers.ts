import { ConfigKeys } from '../enums/config-keys.enum';
import { Observable } from 'rxjs';
import { JsonApiData, StixCore } from 'stix';
import { UserListItem } from '../../models/user/user-profile';

export class RxjsHelpers {

    /**
     * @param  {any[]=[]} arr
     * @returns any
     * @deprecated This was made before Rxjs6 and is not pipeable
     */
    public static mapArrayAttributes(arr: any[] = []): any[] {
        return arr.map((el) => {
            if (el instanceof Array) {
                return el.map((e) => e.attributes);
            } else if (el instanceof Object && el.attributes) {
                return el.attributes;
            } else {
                return el;
            }
        })
    }

    /**
     * @param  {any[]|object|any} el
     * @returns any
     * @deprecated This was made before Rxjs6 and is not pipeable
     */
    public static mapAttributes(el: any[] | object | any): any[] | object | any {
        if (el instanceof Array) {
            return RxjsHelpers.mapArrayAttributes(el);
        } else if (el instanceof Object) {
            return (el as any).attributes || el;
        } else {
            return el;
        }
    }

    /**
     * @returns {() => Observable}
     * @description Takes a JsonApi wrapped Object or Array objects and unwraps the attributes
     *  Usage: obs$.pipe(RxjsHelpers.unwrapJsonApi()), or obs$.pipe(RxjsHelpers.unwrapJsonApi<AttackPattern>())
     */
    public static unwrapJsonApi<T extends StixCore = any>() {
        return (source: Observable<any>) => {
            return new Observable<T[]>((observer) => {
                return source.subscribe({
                    next(data) {
                        if (data instanceof Array) {
                            observer.next(RxjsHelpers.mapArrayAttributes(data));
                        } else if (data instanceof Object) {
                            observer.next((data as any).attributes || data);
                        } else {
                            observer.next(data);
                        }
                    },
                    error(err) { observer.error(err); },
                    complete() { observer.complete(); }
                })
            });
        };
    }

    /**
     * @param  {string} relatedProperty
     * @returns {(Observable<T>) => Observable<any>}
     * @description This is for attack patterns by indicator and intrusion sets by attack pattern unwrapping
     */
    public static relationshipArrayToObject(relatedProperty: string) {
        return <T>(source: Observable<T>) => {
            return new Observable<any>((observer) => {
                return source.subscribe({
                    next(data) {
                        const mapObj: any = {};
                        (data as any).forEach((item) => {
                            mapObj[item._id] = item[relatedProperty];
                            if (mapObj[item._id] === undefined) {
                                console.log('WARNING:', relatedProperty, 'not found on relationhip array');
                            }
                        });
                        observer.next(mapObj);
                    },
                    error(err) { observer.error(err); },
                    complete() { observer.complete(); }
                });
            });
        };
    }

    
    /**
     * @param  {'target_ref'|'source_ref'='target_ref'} keyProperty
     * @returns {(Observable<T>) => Observable<any>}
     * @description This takes an observable stream of [Relationship[], Extends StixCore[]], and will convert
     *      it to a relationship map including the name of the related objects
     */
    public static stixRelationshipArrayToObject(keyProperty: 'target_ref' | 'source_ref' = 'target_ref') {
        return <T>(source: Observable<T[]>) => {
            return new Observable<any>((observer) => {
                return source.subscribe({
                    next([relArray, objsWithName]: any) {
                        const mapObj: any = {};
                        (relArray as any).forEach((item) => {
                            const key = keyProperty === 'target_ref' ? item['target_ref'] : item['source_ref'];
                            const valueId = keyProperty === 'target_ref' ? item['source_ref'] : item['target_ref'];

                            if (!mapObj[key]) {
                                mapObj[key] = new Set();
                            }
                            const foundObj = objsWithName.find((obj) => obj.id === valueId);
                            if (foundObj) {
                                mapObj[key].add(JSON.stringify({
                                    ...foundObj,
                                    name: foundObj && foundObj.name ? foundObj.name : 'Unknown',
                                }));
                            } else {
                                mapObj[key].add(JSON.stringify({
                                    id: valueId,
                                    name: 'Unknown'
                                }));
                            }
                            
                        });
                        for (const key in mapObj) {
                            mapObj[key] = Array.from(mapObj[key]).map((objString: string) => JSON.parse(objString))
                        }
                        observer.next(mapObj);
                    },
                    error(err) { observer.error(err); },
                    complete() { observer.complete(); }
                });
            });
        };
    }
    
    /**
     * @param  {ConfigKeys} configKey
     * @returns {({}) => boolean }
     * @description Usage: this.store.select('config').filter(RxjsHelpers.filterByConfigKey(ConfigKeys.KEY_NAME)).pluck(ConfigKeys.KEY_NAME)
     *  Confirms a key is present in the ngrx config store before continuing with the observable
     */
    public static filterByConfigKey(configKey: ConfigKeys): ({}) => boolean {
        return (configObj: {}): boolean => {
            const UCkeys = Object.keys(configObj).map(key => key.toUpperCase());
            return UCkeys.indexOf(configKey.toUpperCase()) > -1;
        };
    }
    
    /**
     * @param  {string|number} field
     * @param  {'ASCENDING'|'DESCENDING'='DESCENDING'} direction
     * @returns {(Observable<T>) => Observable<T>}
     * @description Sorts an array of objects based on a field inside of those objects.
     *  Usage: arrayObservable$.pipe(RxjsHelpers.sortByField('created'))
     */
    public static sortByField(field: string | number, direction: 'ASCENDING' | 'DESCENDING' = 'DESCENDING') {
        return <T>(source: Observable<T>) => {
            return new Observable<T>((observer) => {
                return source.subscribe({
                    next(data) {
                        (data as any).sort((a: any, b: any) => {
                            if (a[field].toString().toUpperCase() > b[field].toString().toUpperCase()) {
                                if (direction === 'ASCENDING') {
                                    return 1;
                                } else {
                                    return -1;
                                };
                            } else if (a[field].toString().toUpperCase() < b[field].toString().toUpperCase()) {
                                if (direction === 'ASCENDING') {
                                    return -1;
                                } else {
                                    return 1;
                                };
                            } else {
                                return 0;
                            }
                        });
                        observer.next(data);
                    },
                    error(err) { observer.error(err); },
                    complete() { observer.complete(); }
                })
            });
        };     
    }

    /**
     * @returns {() => Observable}
     * @description Recommend use: Before this is called, call a `withLatestFrom(this.store.select('users').pipe(pluck('userList')))`
     *      This will populate comments in the STIX metaProperties with user information.  This variant takes a STIX array
     */
    public static populateSocials<T extends StixCore = any>() {
        return (source: Observable<[T[], UserListItem[]]>) => {
            return new Observable<T[]>((observer) => {
                return source.subscribe({
                    next([stixArr, users]) {
                        observer.next(stixArr.map((stix) => RxjsHelpers.handlePopulateSocial(stix, users)));
                    },
                    error(err) { observer.error(err); },
                    complete() { observer.complete(); }
                })
            });
        };
    }

    /**
     * @returns {() => Observable}
     * @description Recommend use: Before this is called, call a `withLatestFrom(this.store.select('users').pipe(pluck('userList')))`
     *      This will populate comments in the stix metaProperties with user information.  This variants takes a single STIX object
     */
    public static populateSocialsSingle<T extends StixCore = any>() {
        return (source: Observable<any>) => {
            return new Observable<T>((observer) => {
                return source.subscribe({
                    next([stix, users]) {
                        observer.next(RxjsHelpers.handlePopulateSocial(stix, users));
                    },
                    error(err) { observer.error(err); },
                    complete() { observer.complete(); }
                })
            });
        };
    }

    /**
     * @param  {T extends StixCore} stix
     * @param  {UserListItem[]} users
     * @description Common logic for populateSocials and populateSocialsSingle functions
     */
    public static handlePopulateSocial<T extends StixCore = any>(stix: T, users: UserListItem[]) {
        if (stix.metaProperties && stix.metaProperties.comments && stix.metaProperties.comments.length) {
            stix.metaProperties.comments = stix.metaProperties.comments.map((comment) => RxjsHelpers.handlePopulateComment(comment, users));
        }
        return stix;
    }

    public static handlePopulateComment(comment, users: UserListItem[]) {
        if (comment.user && comment.user.id) {
            const foundUser = users.find((user) => user._id === comment.user.id);
            if (foundUser) {
                comment.user.userName = foundUser.userName || 'Unknown';
                comment.user.avatar_url = foundUser.avatar_url;
            }
        }
        if (comment.replies) {
            comment.replies = comment.replies.map((reply) => {
                if (reply.user && reply.user.id) {
                    const foundUser = users.find((user) => user._id === reply.user.id);
                    if (foundUser) {
                        reply.user.userName = foundUser.userName || 'Unknown';
                        reply.user.avatar_url = foundUser.avatar_url;
                    }
                }
                return reply;
            });
        }
        return comment;
    }
}
