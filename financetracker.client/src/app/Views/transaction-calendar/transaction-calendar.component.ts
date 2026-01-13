import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { TransactionService, Transaction } from '../../services/transaction/transaction.service';

@Component({
  selector: 'app-transaction-calendar',
  templateUrl: './transaction-calendar.component.html',
  styleUrls: ['./transaction-calendar.component.css']
})
export class TransactionCalendarComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    events: [],
    eventClick: this.handleEventClick.bind(this),
    datesSet: this.handleDatesSet.bind(this),
    eventContent: this.renderEventContent.bind(this),
    height: 'auto'
  };

  transactions: Transaction[] = [];
  selectedTransaction: Transaction | null = null;
  showTransactionDialog = false;

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.loadTransactions();
  }

  handleDatesSet(dateInfo: any) {
    this.loadTransactions(dateInfo.start, dateInfo.end);
  }

  loadTransactions(startDate?: Date, endDate?: Date) {
    this.transactionService.getTransactionsForCalendar(startDate, endDate).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.updateCalendarEvents();
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
      }
    });
  }

  updateCalendarEvents() {
    const events: EventInput[] = this.transactions.map(transaction => {
      const isExpense = transaction.type?.toLowerCase() === 'expense';
      const categoryName = transaction.category?.name || 'Uncategorized';
      
      return {
        id: transaction.transactionId.toString(),
        title: `${isExpense ? '-' : '+'}${transaction.amount} ${transaction.currency}`,
        date: new Date(transaction.date).toISOString().split('T')[0],
        backgroundColor: isExpense ? '#dc3545' : '#28a745',
        borderColor: isExpense ? '#dc3545' : '#28a745',
        extendedProps: {
          transaction: transaction,
          category: categoryName,
          description: transaction.description || '',
          isRecurring: transaction.isRecurring
        }
      };
    });

    this.calendarOptions = {
      ...this.calendarOptions,
      events: events
    };
  }

  renderEventContent(arg: any) {
    const props = arg.event.extendedProps;
    const title = arg.event.title;
    const category = props.category;
    const description = props.description;
    const isRecurring = props.isRecurring;
    
    const tooltip = `Category: ${category}${description ? '\nDescription: ' + description : ''}${isRecurring ? '\n🔄 Recurring' : ''}`;
    
    return {
      html: `<div class="fc-event-main-frame" title="${tooltip}">
               <div class="fc-event-title-container">
                 <div class="fc-event-title">${title}</div>
                 <div class="fc-event-category">${category}</div>
               </div>
             </div>`
    };
  }

  handleEventClick(clickInfo: any) {
    this.selectedTransaction = clickInfo.event.extendedProps.transaction;
    this.showTransactionDialog = true;
  }

  closeDialog() {
    this.showTransactionDialog = false;
    this.selectedTransaction = null;
  }
}