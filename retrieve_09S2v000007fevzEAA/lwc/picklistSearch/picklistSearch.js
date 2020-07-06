import { LightningElement, wire, track } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import TYPE_FIELD from '@salesforce/schema/Account.Type';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent } from 'c/pubSub';

export default class PicklistSearch extends LightningElement {

    @track error;
    @track options;
    @track value='';
    @wire(CurrentPageReference) pageRef;

    /**
     * This function will get all the picklist values for account type from the standard salesforce module
     * and sets the options and error variable accordingly.
     * 
     */


    @wire(getPicklistValues, { recordTypeId: '012000000000000AAA', fieldApiName: TYPE_FIELD }) f({ data, error }) {

        if (data) {
            var result = JSON.parse(JSON.stringify(data));
            this.options = result.values;

        } else if (error) {
            this.error = 'Unknown error';
            if (Array.isArray(error.body)) {
                this.error = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                this.error = error.body.message;
            }
        }
    };

    /**
     * The return valu from this get property is used in lightning-combobox's options attribute. It adds
     * the default value and label to the available picklist values from the server.
     * 
     */

    get allOptions() {
        return [
            { label: 'All Types', value: '' },
            ...this.options
        ];
    }

    /**
     * This an onchange listner for lightning-combobox input
     */

    handleTypeChange(event) {
        this.value = event.detail.value;
    }

    /**
     * This functions fires a custom event on search button click. it sends the currently selected account
     * type as detail parameter. It also fires another pubsub event to clear the lds component data.
     */

    handleSearchOperation() {
        this.dispatchEvent(new CustomEvent('accountsearch', { detail: this.value }));
        fireEvent(this.pageRef, 'refreshldsdetail', '');
    }

}