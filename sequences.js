const { adminNotification } = require('../email/templates/adminNotification.js')

const { step1Received: assessStep1 } = require('../email/templates/assessment/step1Received.js')
const { step3GrowthProblem } = require('../email/templates/assessment/step3GrowthProblem.js')
const { step4BusinessMistakes } = require('../email/templates/assessment/step4BusinessMistakes.js')
const { step5StrategyInvitation } = require('../email/templates/assessment/step5StrategyInvitation.js')
const { step6FinalFollowUp: assessStep6 } = require('../email/templates/assessment/step6FinalFollowUp.js')

const { step1Received: fgpStep1 } = require('../email/templates/fgp/step1Received.js')
const { step3ProgramOverview } = require('../email/templates/fgp/step3ProgramOverview.js')
const { step4SocialProof } = require('../email/templates/fgp/step4SocialProof.js')
const { step5SlotsReminder } = require('../email/templates/fgp/step5SlotsReminder.js')
const { step6FinalReminder } = require('../email/templates/fgp/step6FinalReminder.js')

const { step1Received: inquiryStep1 } = require('../email/templates/inquiry/step1Received.js')
const { step3HowWeWork } = require('../email/templates/inquiry/step3HowWeWork.js')
const { step4CaseStudy } = require('../email/templates/inquiry/step4CaseStudy.js')
const { step5DiscoveryInvite } = require('../email/templates/inquiry/step5DiscoveryInvite.js')
const { step6FinalFollowUp: inquiryStep6 } = require('../email/templates/inquiry/step6FinalFollowUp.js')

const { step1Received: contactStep1 } = require('../email/templates/contact/step1Received.js')
const { step3CheckIn } = require('../email/templates/contact/step3CheckIn.js')
const { step4Resource } = require('../email/templates/contact/step4Resource.js')
const { step5SoftInvite } = require('../email/templates/contact/step5SoftInvite.js')
const { step6FinalCheckIn } = require('../email/templates/contact/step6FinalCheckIn.js')

const { step1Received: applicantStep1 } = require('../email/templates/applicant/step1Received.js')
const { step3HiringProcess } = require('../email/templates/applicant/step3HiringProcess.js')
const { step4Culture } = require('../email/templates/applicant/step4Culture.js')
const { step5StatusCheckin } = require('../email/templates/applicant/step5StatusCheckin.js')
const { step6FinalFollowUp: applicantStep6 } = require('../email/templates/applicant/step6FinalFollowUp.js')

// Each sequence is keyed by the Firestore collection it watches. `nameField`
// and `emailField` tell the engine which fields on the source document hold
// the person's name/email (they differ slightly across your five forms).
// Every sequence follows the same 6-step cadence: immediate confirmation +
// immediate internal alert, then day 1 / day 3 / day 5 / day 7 follow-ups —
// but the actual content is tailored per source, not copy-pasted.
const SEQUENCES = {
  intake_leads: {
    formType: 'assessment',
    nameField: 'name',
    emailField: 'email',
    steps: [
      { step: 1, delayMinutes: 0,    audience: 'customer', template: assessStep1,          subject: d => `We've Received Your Business Growth Assessment` },
      { step: 2, delayMinutes: 0,    audience: 'admin',    template: adminNotification,     subject: d => `New Business Growth Assessment — ${d.business || d.name}` },
      { step: 3, delayMinutes: 1440, audience: 'customer', template: step3GrowthProblem,    subject: d => `Most businesses aren't invisible by accident` },
      { step: 4, delayMinutes: 4320, audience: 'customer', template: step4BusinessMistakes, subject: d => `Three mistakes we see over and over` },
      { step: 5, delayMinutes: 7200, audience: 'customer', template: step5StrategyInvitation, subject: d => `Want a second pair of eyes on this?` },
      { step: 6, delayMinutes: 10080, audience: 'customer', template: assessStep6,          subject: d => `Last one from us on this` }
    ]
  },
  fgp_applications: {
    formType: 'fgp',
    nameField: 'ownerName',
    emailField: 'email',
    steps: [
      { step: 1, delayMinutes: 0,    audience: 'customer', template: fgpStep1,             subject: d => `Your Founding Growth Partners Application Has Been Received` },
      { step: 2, delayMinutes: 0,    audience: 'admin',    template: adminNotification,     subject: d => `New FGP Application — ${d.businessName || d.name}` },
      { step: 3, delayMinutes: 1440, audience: 'customer', template: step3ProgramOverview, subject: d => `Here's exactly what the program includes` },
      { step: 4, delayMinutes: 4320, audience: 'customer', template: step4SocialProof,     subject: d => `Why businesses actually finish this program` },
      { step: 5, delayMinutes: 7200, audience: 'customer', template: step5SlotsReminder,   subject: d => `Still only 10 spots` },
      { step: 6, delayMinutes: 10080, audience: 'customer', template: step6FinalReminder,  subject: d => `One week in — here's where things stand` }
    ]
  },
  service_inquiries: {
    formType: 'inquiry',
    nameField: 'name',
    emailField: 'email',
    steps: [
      { step: 1, delayMinutes: 0,    audience: 'customer', template: inquiryStep1,          subject: d => `We've Got Your Request` },
      { step: 2, delayMinutes: 0,    audience: 'admin',    template: adminNotification,     subject: d => `New Service Inquiry — ${d.name}` },
      { step: 3, delayMinutes: 1440, audience: 'customer', template: step3HowWeWork,        subject: d => `How we actually work` },
      { step: 4, delayMinutes: 4320, audience: 'customer', template: step4CaseStudy,        subject: d => `Does this actually work?` },
      { step: 5, delayMinutes: 7200, audience: 'customer', template: step5DiscoveryInvite,  subject: d => `Want to just talk it through?` },
      { step: 6, delayMinutes: 10080, audience: 'customer', template: inquiryStep6,         subject: d => `We'll leave it here` }
    ]
  },
  contact_messages: {
    formType: 'contact',
    nameField: 'name',
    emailField: 'email',
    steps: [
      { step: 1, delayMinutes: 0,    audience: 'customer', template: contactStep1,          subject: d => `Thanks for Reaching Out` },
      { step: 2, delayMinutes: 0,    audience: 'admin',    template: adminNotification,     subject: d => `New Contact Message — ${d.name}` },
      { step: 3, delayMinutes: 1440, audience: 'customer', template: step3CheckIn,          subject: d => `Just checking in` },
      { step: 4, delayMinutes: 4320, audience: 'customer', template: step4Resource,         subject: d => `Something that might be useful` },
      { step: 5, delayMinutes: 7200, audience: 'customer', template: step5SoftInvite,       subject: d => `Still here if useful` },
      { step: 6, delayMinutes: 10080, audience: 'customer', template: step6FinalCheckIn,    subject: d => `Last note from us` }
    ]
  },
  applicants: {
    formType: 'applicant',
    nameField: 'name',
    emailField: 'email',
    steps: [
      { step: 1, delayMinutes: 0,    audience: 'customer', template: applicantStep1,        subject: d => `We've Received Your Application` },
      { step: 2, delayMinutes: 0,    audience: 'admin',    template: adminNotification,     subject: d => `New Job Application — ${d.name} (${d.role || 'role unspecified'})` },
      { step: 3, delayMinutes: 1440, audience: 'customer', template: step3HiringProcess,    subject: d => `What happens next` },
      { step: 4, delayMinutes: 4320, audience: 'customer', template: step4Culture,          subject: d => `What TEKNNUKU actually is` },
      { step: 5, delayMinutes: 7200, audience: 'customer', template: step5StatusCheckin,    subject: d => `Still reviewing your application` },
      { step: 6, delayMinutes: 10080, audience: 'customer', template: applicantStep6,       subject: d => `Closing the loop` }
    ]
  }
};

module.exports = { SEQUENCES };
