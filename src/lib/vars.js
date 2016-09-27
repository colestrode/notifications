module.exports = {
  google: {
    privateKey: process.env.G_PRIVATE_KEY.replace(/\\n/g, '\n'),
    spreadsheet: process.env.G_SPREADSHEET,
    email: process.env.G_EMAIL,
    calendarIds: process.env.G_CALENDAR_IDS.split(','),
    calendarCreator: process.env.G_CALENDAR_CREATOR
  },
  sparkpost: {
    apiKey: process.env.SPARKPOST_API_KEY
  }
};
