import * as utilityActions from './utility.actions';
import { Themes } from '../../global/enums/themes.enum';

export interface UtilityState {
    theme: Themes,
    showFooter: boolean,
    title: string
}

export const initialState: UtilityState = {
    theme: Themes.DEFAULT,
    showFooter: true,
    title: ''
};

export function utilityReducer(state = initialState, action: utilityActions.UtilityActions) {
    switch (action.type) {
        case utilityActions.SET_THEME:
            return {
                ...state,
                theme: action.payload
            };
        case utilityActions.SET_TITLE:
            return {
                ...state,
                title: action.payload
            };
        case utilityActions.SHOW_FOOTER:
            return {
                ...state,
                showFooter: true
            };
        case utilityActions.HIDE_FOOTER:
            return {
                ...state,
                showFooter: false
            };
        default:
            return state;
    }
}
