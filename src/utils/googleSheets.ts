
/**
 * Utility to sync user data to Google Sheets via Google App Script Web App.
 * 
 * INSTRUCTIONS FOR USER:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. REPLACE the existing code with the following (supports GET and POST):
 * 
 * ```javascript
 * function doPost(e) {
 *   var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *   var data = JSON.parse(e.postData.contents);
 *   var action = data.action || 'create'; // 'create' or 'update'
 *   
 *   if (action === 'create') {
 *      sheet.appendRow([
 *        data.id || Utilities.getUuid(),
 *        data.full_name || '',
 *        data.phone || '',
 *        data.email,
 *        data.provider || 'Credentials',
 *        data.account_type || 'Free',
 *        data.subscription_level || 'None',
 *        new Date()
 *      ]);
 *      return ContentService.createTextOutput(JSON.stringify({'result': 'success', 'message': 'User created'})).setMimeType(ContentService.MimeType.JSON);
 *   }
 *   
 *   if (action === 'update') {
 *      // Find row by Email (Column D -> index 3)
 *      var range = sheet.getDataRange();
 *      var values = range.getValues();
 *      var rowIndex = -1;
 *      
 *      for (var i = 0; i < values.length; i++) {
 *          if (values[i][3] === data.email) { // 0-based index, 3 is Column D (Email)
 *              rowIndex = i + 1; // 1-based row index for updating
 *              break;
 *          }
 *      }
 *      
 *      if (rowIndex > 0) {
 *          // Update specific columns if provided
 *          if (data.account_type) sheet.getRange(rowIndex, 6).setValue(data.account_type); // Column F
 *          if (data.subscription_level) sheet.getRange(rowIndex, 7).setValue(data.subscription_level); // Column G
 *          // Add more fields here as needed
 *          
 *          return ContentService.createTextOutput(JSON.stringify({'result': 'success', 'message': 'User updated'})).setMimeType(ContentService.MimeType.JSON);
 *      } else {
 *          return ContentService.createTextOutput(JSON.stringify({'result': 'error', 'message': 'User not found'})).setMimeType(ContentService.MimeType.JSON);
 *      }
 *   }
 * }
 * 
 * function doGet(e) {
 *   var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *   var data = sheet.getDataRange().getValues();
 *   var users = [];
 *   
 *   // Skip header row (start at i=1)
 *   // Assuming columns: ID, Full Name, Phone, Email, Provider, Account Type, Subscription Level, Created At
 *   for (var i = 1; i < data.length; i++) {
 *     var row = data[i];
 *     users.push({
 *       id: row[0],
 *       full_name: row[1],
 *       phone: row[2],
 *       email: row[3],
 *       provider: row[4],
 *       account_type: row[5],
 *       subscription_level: row[6],
 *       created_at: row[7]
 *     });
 *   }
 *   
 *   return ContentService.createTextOutput(JSON.stringify(users)).setMimeType(ContentService.MimeType.JSON);
 * }
 * ```
 * 
 * 4. Deploy > Manage Deployments > Edit (pencil) > New Version > Deploy.
 *    (Ensure "Who has access" is set to "Anyone")
 */

export interface UserData {
    email: string;
    id?: string;
    full_name?: string;
    phone?: string;
    provider?: 'Google' | 'Credentials';
    account_type?: 'Free' | 'VIP1' | 'VIP2' | 'Admin'; // Added Admin
    subscription_level?: 'None' | 'Pro' | 'Lifetime';
    action?: 'create' | 'update';
    created_at?: string;
}

const getWebhookUrl = () => {
    // Check if we are in Vite environment or elsewhere (just in case)
    return import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;
};

export const syncUserToGoogleSheets = async (userData: UserData) => {
    const webhookUrl = getWebhookUrl();

    if (!webhookUrl) {
        console.warn('VITE_GOOGLE_SHEETS_WEBHOOK_URL is not defined. Skipping Google Sheets sync.');
        return;
    }

    try {
        const payload = { ...userData, action: 'create' };

        await fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(payload),
        });

        console.log('User sync (create) request sent to Google Sheets');
    } catch (error) {
        console.error('Failed to sync user to Google Sheets', error);
    }
};

export const fetchUsersFromSheet = async (): Promise<UserData[]> => {
    const webhookUrl = getWebhookUrl();
    if (!webhookUrl) return [];

    try {
        const response = await fetch(webhookUrl, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data as UserData[];
    } catch (error) {
        console.error('Failed to fetch users from Google Sheets:', error);
        return [];
    }
};

export const updateUserInSheet = async (userData: Partial<UserData> & { email: string }) => {
    const webhookUrl = getWebhookUrl();

    if (!webhookUrl) {
        console.warn('VITE_GOOGLE_SHEETS_WEBHOOK_URL is not defined.');
        return;
    }

    try {
        const payload = { ...userData, action: 'update' };

        await fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(payload),
        });

        console.log('User update request sent to Google Sheets');
    } catch (error) {
        console.error('Failed to update user in Google Sheets', error);
    }
};
