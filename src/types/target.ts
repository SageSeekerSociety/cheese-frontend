export type Target = {
  id: number
  name: string
  intro: string
  created_at: number
  start_date: number
  end_date: number
  attendance: {
    frequency: string
  }
}
