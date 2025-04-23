# Supabase Email Templates

This directory contains HTML templates for customizing Supabase authentication emails.

## Available Templates

- `supabase-confirm-signup.html` - Template for the sign-up confirmation email

## How to Deploy Email Templates

To update the email templates in your Supabase project:

1. Log in to the [Supabase Dashboard](https://app.supabase.io/)
2. Navigate to your project
3. Go to **Authentication** → **Email Templates**
4. Select the template you want to update (e.g., "Confirm Signup")
5. Copy and paste the HTML content from the corresponding file in this directory
6. Update the subject line to "Confirm your account with Modern Kanban Board"
7. Click **Save**

## Customization Notes

- The templates use inline CSS for maximum email client compatibility
- The primary color used is `#6366F1` (indigo)
- Replace the logo URL with your actual logo URL before deploying
- Update the support email address with your actual support email

## Testing

After deploying a new template, it's recommended to:

1. Create a test user account
2. Check that the confirmation email arrives with the correct formatting
3. Verify that all links in the email work correctly

## Troubleshooting

If the email doesn't appear as expected:

- Check that all HTML tags are properly closed
- Ensure the `{{ .ConfirmationURL }}` placeholder is preserved
- Test the email in multiple email clients (Gmail, Outlook, etc.)
- Consider using a service like Litmus or Email on Acid for comprehensive testing
