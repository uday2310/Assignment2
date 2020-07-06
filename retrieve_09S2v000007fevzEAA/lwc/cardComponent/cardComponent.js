import { LightningElement , api, wire} from 'lwc';
import {CurrentPageReference} from 'lightning/navigation';
import {fireEvent} from 'c/pubSub';

export default class CardComponent extends LightningElement {

    // account propery will be set in parent component (searchResults)
    @api account;
    @wire(CurrentPageReference) pageRef;

    /**
     * onclick handler for detail button. this fires an pubsub event along with selected accountId
     * which is handled by the ldsDetailComponent inorder to show full detail of selected account.
     * 
     */

    handleDetailAccount(event){

        var eventParam = {'accountId':this.account.Id};
        fireEvent(this.pageRef,'detailaccount',eventParam);

    }
}