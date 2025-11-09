export interface NotificationsDTO {
  message: string;
  englishMessage: string;
  receiver: string;
  idskvNotification: string;
  link?: string;
  opened?: boolean;
  timeOfSending: Date;
  priority?: string;
  type?: string
}



