import { format, formatDistanceToNow, parseISO } from 'date-fns'

export const formatKickoff = (iso: string) =>
  format(parseISO(iso), 'dd MMM · HH:mm')

export const formatRelative = (iso: string) =>
  formatDistanceToNow(parseISO(iso), { addSuffix: true })

export const formatMinute = (minute: number) =>
  minute > 90 ? `${minute}'` : `${minute}'`