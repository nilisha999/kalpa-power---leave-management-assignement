import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { publish, MessageContext } from 'lightning/messageService';
import LEAVE_UPDATE_CHANNEL from '@salesforce/messageChannel/leaveUpdateChannel__c';

// Import Apex methods
import submitLeaveRequest from '@salesforce/apex/LeaveRequestController.submitLeaveRequest';
import getUserLeaveHistory from '@salesforce/apex/LeaveRequestController.getUserLeaveHistory';

export default class MyLeaveRequestForm extends LightningElement {
    @track leaveData = { leaveType: '', fromDate: null, toDate: null };
    @track leaveHistory = [];
    wiredLeaveHistoryResult; // Used to store the wired data result for refreshApex


    // Define columns for the lightning-datatable
    columns = [
        { label: 'Leave Type', fieldName: 'Leave_Type__c', type: 'text' },
        { label: 'From Date', fieldName: 'From_Date__c', type: 'date-local' },
        { label: 'To Date', fieldName: 'To_Date__c', type: 'date-local' },
        { label: 'Status', fieldName: 'Status__c', type: 'text' }
    ];

    // Options for the leave type combobox
    get leaveTypeOptions() {
        return [
            { label: 'Sick', value: 'Sick' },
            { label: 'Casual', value: 'Casual' },
            { label: 'Paid', value: 'Paid' }
        ];
    }

    // Wire service to call the Apex method and get the leave history
    @wire(getUserLeaveHistory)
    wiredLeaveHistory(result) {
        this.wiredLeaveHistoryResult = result; // Assign the result to the property for refreshApex
        if (result.data) {
            this.leaveHistory = result.data;
        } else if (result.error) {
            console.error('Error fetching leave history:', result.error);
        }
    }

    // Handle input changes and update the leaveData object
    handleInputChange(event) {
        const field = event.target.dataset.field;
        this.leaveData = { ...this.leaveData, [field]: event.target.value };
    }

    @wire(MessageContext)
    messageContext; // This is a required property for LMS
    // Handle the submit button click
    async handleSubmit() {
        try {
            await submitLeaveRequest({
                leaveType: this.leaveData.leaveType,
                fromDate: this.leaveData.fromDate,
                toDate: this.leaveData.toDate
            });
            this.showToast('Success', 'Leave request submitted successfully!', 'success');
            // Refresh the leave history data table
            await refreshApex(this.wiredLeaveHistoryResult);

            // Publish the message to the channel
            const payload = { update: true };
            publish(this.messageContext, LEAVE_UPDATE_CHANNEL, payload);

            this.showToast('Success', 'Leave request submitted successfully!', 'success');
            await refreshApex(this.wiredLeaveHistoryResult);
        } catch (error) {
            this.showToast('Error', 'Failed to submit leave request.', 'error');
            console.error('Error submitting leave:', error);
        }
    }

    // Helper function to show a toast message
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }


}
