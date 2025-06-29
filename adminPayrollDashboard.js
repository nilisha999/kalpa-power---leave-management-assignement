import { LightningElement, wire, track } from 'lwc';
import getAllPayrolls from '@salesforce/apex/PayrollController.getAllPayrolls';

export default class AdminPayrollDashboard extends LightningElement {
    @track monthFilter = '';
    @track designationFilter = '';
    allPayrolls = []; // Stores all payroll data from Apex

    // Columns for the lightning-datatable
    columns = [
        { label: 'Employee Name', fieldName: 'EmployeeName', type: 'text' },
        { label: 'Designation', fieldName: 'Designation', type: 'text' },
        { label: 'Month', fieldName: 'Month__c', type: 'text' },
        { label: 'Net Salary', fieldName: 'Net_Salary__c', type: 'currency' }
    ];

    // Options for the month filter combobox
    monthOptions = [
        { label: 'January', value: 'January' },
        { label: 'February', value: 'February' },
        { label: 'March', value: 'March' },
        { label: 'April', value: 'April' },
        { label: 'May', value: 'May' },
        { label: 'June', value: 'June' },
        { label: 'July', value: 'July' },
        { label: 'August', value: 'August' },
        { label: 'September', value: 'September' },
        { label: 'October', value: 'October' },
        { label: 'November', value: 'November' },
        { label: 'December', value: 'December' }
    ];

    // Wire service to fetch all payroll records
    @wire(getAllPayrolls)
    wiredPayrolls({ error, data }) {
        if (data) {
            // Map the data to flatten the lookup fields for the datatable
            this.allPayrolls = data.map(item => ({
                ...item,
                EmployeeName: item.Employee__r ? item.Employee__r.Name : '',
                Designation: item.Employee__r ? item.Employee__r.Designation__c : ''
            }));
        } else if (error) {
            console.error('Error fetching payroll data:', error);
        }
    }

    // Getter to apply filtering logic on the client side
    get filteredPayrolls() {
        if (!this.allPayrolls) {
            return [];
        }

        return this.allPayrolls.filter(payroll => {
            const monthMatch = this.monthFilter ? payroll.Month__c === this.monthFilter : true;
            const designationMatch = this.designationFilter ?
                payroll.Designation.toLowerCase().includes(this.designationFilter.toLowerCase()) : true;

            return monthMatch && designationMatch;
        });
    }

    // Handle changes in the filter inputs
    handleFilterChange(event) {
        const filterType = event.target.dataset.filter;
        if (filterType === 'month') {
            this.monthFilter = event.target.value;
        } else if (filterType === 'designation') {
            this.designationFilter = event.target.value;
        }
    }

    // Logic to export the filtered data to a CSV file
    handleExportCsv() {
        if (!this.filteredPayrolls || this.filteredPayrolls.length === 0) {
            return;
        }

        const header = ['Employee Name', 'Designation', 'Month', 'Net Salary'];
        const rows = this.filteredPayrolls.map(row => [
            row.EmployeeName,
            row.Designation,
            row.Month__c,
            row.Net_Salary__c
        ]);

        let csvString = header.join(',') + '\n';
        csvString += rows.map(row => row.join(',')).join('\n');

        const a = document.createElement('a');
        a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString);
        a.target = '_blank';
        a.download = 'Payroll_Report.csv';
        a.click();
    }
}
