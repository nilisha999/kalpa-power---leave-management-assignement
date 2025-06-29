import { LightningElement, wire } from 'lwc';
import getMyPayrollSlips from '@salesforce/apex/PayrollController.getMyPayrollSlips';
import { subscribe, MessageContext } from 'lightning/messageService';
import { refreshApex } from '@salesforce/apex';
import LEAVE_UPDATE_CHANNEL from '@salesforce/messageChannel/leaveUpdateChannel__c';

export default class PayrollViewer extends LightningElement {
    // Use the wire service to automatically call the Apex method
    @wire(getMyPayrollSlips)
    wiredPayrolls; // The wired data is available in the wiredPayrolls.data and wiredPayrolls.error properties

    @wire(MessageContext)
messageContext;
subscription = null;

// Use connectedCallback to subscribe when the component loads
connectedCallback() {
    this.subscription = subscribe(
        this.messageContext, 
        LEAVE_UPDATE_CHANNEL,
        (message) => this.handleLeaveUpdate(message)
    );
}

// Handler to refresh data when a message is received
handleLeaveUpdate(message) {
    if (message.update) {
        // Call refreshApex to reload the wired data
        refreshApex(this.wiredPayrolls);
    }
}
}
