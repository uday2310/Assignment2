import { LightningElement, wire, api, track } from 'lwc';
import searchAcc from '@salesforce/apex/LwcAccountSearch.searchAcc';
import { refreshApex } from '@salesforce/apex';
import { registerListener, unregisterAllListeners } from 'c/pubSub';
import { CurrentPageReference } from 'lightning/navigation';

export default class SearchResults extends LightningElement {

    @track accounts;
    @track error;
    @wire(CurrentPageReference) pageRef;
    wiredAccount;
    accountType;


    /**
     * call to salesforce apex server method to get the account records based on the 
     * account type. 
     */
    @wire(searchAcc, { accountType: '$accountType' }) f(value) {

        //copy of the server results which later will be refreshed to get the latest data. 
        this.wiredAccount = value;

        if (value.data) {
            var result = JSON.parse(JSON.stringify(value.data));
            this.accounts = result;
            return refreshApex(this.wiredAccount);
        }

        else if (value.error) {
            this.error = 'Unknown error';
            if (Array.isArray(value.error.body)) {
                this.error = value.error.body.map(e => e.message).join(', ');
            } else if (typeof value.error.body.message === 'string') {
                this.error = value.error.body.message;
            }
        }

    }

    /**
     * handles the pubsub event fired by ldsDetail component.
     */

    connectedCallback() {
        registerListener('refreshsearchresults', this.handleRefresh, this);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    /**
     * public method which is called by parent component (rootParent). accountType variable gets the value
     * 
     */

    @api assignType(type) {
        this.accountType = type;
    }

    handleRefresh() {
        return refreshApex(this.wiredAccount);
    }
}