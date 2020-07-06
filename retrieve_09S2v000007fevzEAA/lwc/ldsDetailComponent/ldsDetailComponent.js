import { LightningElement, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners } from 'c/pubSub';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import TYPE_FIELD from '@salesforce/schema/Account.Type';
import RATING_FIELD from '@salesforce/schema/Account.Rating';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
import ACCOUNTNUMBER_FIELD from '@salesforce/schema/Account.AccountNumber';
import ID_FIELD from '@salesforce/schema/Account.Id';
import { fireEvent } from 'c/pubSub';


export default class LdsDetailComponent extends LightningElement {

    // this property controlls whether the component detail will be shown in view mode or edit mode.
    @track showView = true;

    //showLdsDetail will controls the visibility..if no data is present then default message would be 
    //displayed
    @track showLdsDetail= true;

    @wire(CurrentPageReference) pageRef;
    accountId;

    /**
     * account type from the server will be assigned to typeOptions. if error occurs than it will be
     * assigned to typeError.
     */
    @track typeOptions;
    @track typeError;

    /**
     * account Industry values from the server will be assigned to industryOptions. if error occurs than it will be
     * assigned to industryError.
     */
    @track industryOptions;
    @track industryError;

    /**
     * account Rating from the server will be assigned to ratingOptions. if error occurs than it will be
     * assigned to ratingError.
     */
    @track ratingOptions;
    @track ratingError;

    //get account record based on the recordId provided by cardComponent through the pubsub event
    @wire(getRecord, { recordId: '$accountId', fields: [NAME_FIELD, INDUSTRY_FIELD, PHONE_FIELD, TYPE_FIELD, RATING_FIELD, ACCOUNTNUMBER_FIELD] }) account;

    // account type values from server
    @wire(getPicklistValues, { recordTypeId: '012000000000000AAA', fieldApiName: TYPE_FIELD }) type({ data, error }) {

        if (data) {
            var result = JSON.parse(JSON.stringify(data));
            this.typeOptions = result.values;


        } else if (error) {
            this.typeError = 'Unknown error';
            if (Array.isArray(error.body)) {
                this.typeError = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                this.typeError = error.body.message;
            }

            console.log('error loading type options ' + this.typeError);
        }
    };

    // account industry values from the server
    @wire(getPicklistValues, { recordTypeId: '012000000000000AAA', fieldApiName: INDUSTRY_FIELD }) industry({ data, error }) {

        if (data) {
            var result = JSON.parse(JSON.stringify(data));
            this.industryOptions = result.values;

        } else if (error) {
            this.industryError = 'Unknown error';
            if (Array.isArray(error.body)) {
                this.industryError = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                this.industryError = error.body.message;
            }

            console.log('error loading industry options ' + this.industryError);
        }
    };

    // account Rating values from the server
    @wire(getPicklistValues, { recordTypeId: '012000000000000AAA', fieldApiName: RATING_FIELD }) rating({ data, error }) {

        if (data) {
            var result = JSON.parse(JSON.stringify(data));
            this.ratingOptions = result.values;

        } else if (error) {
            this.ratingError = 'Unknown error';
            if (Array.isArray(error.body)) {
                this.ratingError = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                this.ratingError = error.body.message;
            }

            console.log('error loading rating options ' + this.ratingError);
        }
    };


    // register the event handler from the cardComponent and picklistSearchComponent respectivaly
    connectedCallback() {
        registerListener('detailaccount', this.handleDetailAccount, this);
        registerListener('refreshldsdetail', this.handleRefreshLdsDetail, this);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    /**
     * handler function for event fired by cardComponent. sets the accountId property with the value 
     * from event detail. also sets the showLdsDetail true because now it will have account data.
     * 
     */
    handleDetailAccount(detail) {
        this.showLdsDetail = true;
        this.accountId = detail.accountId;
    }

    // chanhe handler for lightning-input during edit mode of ldsDetailComponent
    handleChange(event) {

        if (!event.target.value) {
            event.target.reportValidity();
        }
    } 

    /** 
     * this function handles the account update operation during edit mode of component.
     */

    handleUpdateAccount() {

        // check the validity of the entered values in the edit form 
        const allValid = [...this.template.querySelectorAll('lightning-input'), 
                                ...this.template.querySelectorAll('lightning-combobox')]
            .reduce((validSoFar, inputFields) => {
                inputFields.reportValidity();
                return validSoFar && inputFields.checkValidity();
            }, true);

        if (allValid) {

            // takes the values eneterd by user.
            const fields = {}; 
            fields[ID_FIELD.fieldApiName] = this.accountId;
            fields[NAME_FIELD.fieldApiName] = this.template.querySelector("[data-field='Name']").value;
            fields[INDUSTRY_FIELD.fieldApiName] = this.template.querySelector("[data-field='Industry']").value;
            fields[PHONE_FIELD.fieldApiName] = this.template.querySelector("[data-field='Phone']").value;
            fields[ACCOUNTNUMBER_FIELD.fieldApiName] = this.template.querySelector("[data-field='Account Number']").value;
            fields[TYPE_FIELD.fieldApiName] = this.template.querySelector("[data-field='Type']").value;
            fields[RATING_FIELD.fieldApiName] = this.template.querySelector("[data-field='Rating']").value;

            const recordInput = { fields }; // this variable is passes as parameter in updateRecord opertaion

            updateRecord(recordInput)
                .then(() => {
                    this.showView = !this.showView;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Account updated',
                            variant: 'success'
                        })
                    );
                    
                    fireEvent(this.pageRef, 'refreshsearchresults', ''); // to refresh the searchResults component with the updated data.
                    return refreshApex(this.account);

                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error updating record',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                });
        }

        else {
            // The form is not valid
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Something is wrong',
                    message: 'Check your input and try again.',
                    variant: 'error'
                })
            );
        }
    }


    // handler for edit button. this will toggle the value of showView and edit part of the component
    // will be rendered...
    handleEditAccount() {
        this.showView = !this.showView;
    }

    /**
     * handler for event fired by the picklistSearch component. when user click search on picklistSearch
     * component with different type then the data in ldsDetailComponent vanishes.
     */ 
    handleRefreshLdsDetail() {
        this.showLdsDetail = false;
    }


    // handler for cancel button during edit mode of the component.
    handleCancelOperation() {
        this.showView = true;
    }

    /**
     * adding default value and label to result from server
     */
    get typeOptionsWithNone() {
        return [
            { label: '--None--', value: '' },
            ...this.typeOptions
        ];
    }


    /**
     * adding default value and label to result from server
     */
    get industryOptionsWithNone() {
        return [
            { label: '--None--', value: '' },
            ...this.industryOptions
        ];
    }


    /**
     * adding default value and label to result from server
     */
    get ratingOptionsWithNone() {
        return [
            { label: '--None--', value: '' },
            ...this.ratingOptions
        ];
    }

}