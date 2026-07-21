import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent, FooterComponent } from '../../shared';
import { ChatWidgetComponent } from '../../features/chat/components/chat-widget/chat-widget.component';
import { ToastContainerComponent } from '../../admin/shared/components/toast-container/toast-container.component';
import { CustomerOrderToastService } from '../../core/services/customer-order-toast.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ChatWidgetComponent, ToastContainerComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit {
  constructor(private orderToast: CustomerOrderToastService) {}

  ngOnInit(): void {
    this.orderToast.start();
  }
}
