const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src/pages/Dashboard');

const files = [
  'AbTestCampaignResult.js',
  'AddCall.js',
  'AddCampaign.js',
  'AddEmail.js',
  'AddIcp.js',
  'AddLead.js',
  'AddReport.js',
  'AddVectorStore.js',
  'AdminDashboard.js',
  'Automation.js',
  'CallAnalysis.js',
  'CallDetails.js',
  'Calls.js',
  'Campaigns.js',
  'ConfirmLeadsUpload.js',
  'CreateEmailCampaign.js',
  'CreateWorkflow.js',
  'DeleteCall.js',
  'DeleteCampaign.js',
  'DeleteEmail.js',
  'DeleteEmailCampaign.js',
  'DeleteIcp.js',
  'DeleteLead.js',
  'DeleteReport.js',
  'DeleteVectorStore.js',
  'DiscoverDomain.js',
  'DomainSearchResult.js',
  'EditCampaign.js',
  'EditIcp.js',
  'EditLead.js',
  'EditVectorStore.js',
  'EmailCampaignsList.js',
  'EmailDraft.js',
  'EmailFinder.js',
  'EmailFinderResult.js',
  'Emails.js',
  'ExportRecipientsEmailCampaign.js',
  'FindEmail.js',
  'Home.js',
  'Leads.js',
  'ManageIcp.js',
  'QualifyLead.js',
  'RealtimeConversation.js',
  'Reports.js',
  'SearchEmails.js',
  'SearchResults.js',
  'SendEmail.js',
  'SendEmailCampaignNow.js',
  'SendReportEmailCampaign.js',
  'SendTestEmailCampaign.js',
  'Settings.js',
  'SharedTemplateUrl.js',
  'TestEmail.js',
  'ThreadDetail.js',
  'UpdateCampaignStatus.js',
  'UpdateEmailCampaign.js',
  'UploadImageToGallery.js',
  'UploadLeads.js',
  'VectorStores.js',
  'VerifyEmailResult.js',
  'ViewCall.js',
  'ViewCampaign.js',
  'ViewEmail.js',
  'ViewEmailCampaign.js',
  'ViewLead.js',
  'ViewReport.js',
];

// Create base directory if not exists
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

// Create each file with default template
files.forEach((file) => {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      `import React from 'react';

const ${file.replace('.js', '')} = () => {
  return <div>${file.replace('.js', '').replace(/([A-Z])/g, ' $1').trim()} Page</div>;
};

export default ${file.replace('.js', '')};`
    );
  }
});

console.log('Files created successfully!');