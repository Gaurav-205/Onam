export const sendWithTimeout = async (transporter, mailOptions, timeoutMs) => {
  const sendPromise = transporter.sendMail(mailOptions)
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Email send timeout after ${timeoutMs / 1000} seconds`)), timeoutMs)
  })

  return Promise.race([sendPromise, timeoutPromise])
}
