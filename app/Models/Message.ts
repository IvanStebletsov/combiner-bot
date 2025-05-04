export class Message {
  user: string
  timestamp: number
  date: Date
  text: string

  constructor(
    user: string,
    timestamp: number,
    date: Date,
    text: string,
  ) {
    this.user = user
    this.timestamp = timestamp
    this.date = date
    this.text = text
  }
}