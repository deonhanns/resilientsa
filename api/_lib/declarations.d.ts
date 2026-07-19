declare module 'africastalking' {
  const at: (config: { apiKey: string; username: string }) => {
    SMS: {
      send: (opts: {
        to: string[]
        message: string
        from?: string
      }) => Promise<{ SmsMessageData: { Recipients: { status: string }[] } }>
    }
  }
  export default at
}
