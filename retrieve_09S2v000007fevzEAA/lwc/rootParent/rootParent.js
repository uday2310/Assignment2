import { LightningElement } from 'lwc';


export default class RootParent extends LightningElement {

    /**
     * This function is the event handler for the event fired by picklistSearch child component.
     * It calls the assignType method which belongs to its another child component 'searchResults' and
     * passes the account type recevied as a detail along with the event.  
     */

    handleAccountsearch(event) {
        this.template.querySelector('c-search-results').assignType(event.detail);
    }

}