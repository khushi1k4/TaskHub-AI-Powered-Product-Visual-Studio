import resend
from config import Config

resend.api_key = Config.RESEND_API_KEY

# Using a generic sender address since we may be on a free/sandbox Resend plan.
SENDER_EMAIL = "onboarding@resend.dev"

def send_email(to_email, subject, html_content):
    try:
        from tasks.notification_tasks import send_email_async
        send_email_async.delay(subject, to_email, html_content, html_content)
        print(f"Queued email to {to_email} asynchronously.")
        return True
    except Exception as e:
        print(f"Failed to queue email to {to_email}: {e}")
        return False

def send_task_assigned_email(to_email, task_title, due_date, admin_name):
    subject = f"New Task Assigned: {task_title}"
    html = f"""
    <h2>You have a new task!</h2>
    <p>Admin <strong>{admin_name}</strong> has assigned you a new AI product generation task: <strong>{task_title}</strong>.</p>
    <p><strong>Due Date:</strong> {due_date if due_date else 'No due date specified'}</p>
    <br/>
    <p>Please log in to your dashboard to view the details and start working.</p>
    """
    return send_email(to_email, subject, html)

def send_task_accepted_email(to_email, task_title, admin_name):
    subject = f"Task Accepted: {task_title}"
    html = f"""
    <h2>Great news!</h2>
    <p>Your submission for the task <strong>{task_title}</strong> has been reviewed and <strong style="color: green;">Accepted</strong> by admin <strong>{admin_name}</strong>.</p>
    <br/>
    <p>Thank you for your hard work!</p>
    """
    return send_email(to_email, subject, html)

def send_task_revision_email(to_email, task_title, admin_name):
    subject = f"Revision Requested: {task_title}"
    html = f"""
    <h2>Action Required</h2>
    <p>Admin <strong>{admin_name}</strong> has requested a <strong style="color: red;">Revision</strong> on your submission for the task <strong>{task_title}</strong>.</p>
    <br/>
    <p>Please log in to your dashboard to review the task details and submit an updated version.</p>
    """
    return send_email(to_email, subject, html)

def send_task_submitted_email(admin_email, admin_name, user_name, task_title):
    subject = f"Task Submitted for Review: {task_title}"
    html = f"""
    <h2>Task Ready for Review</h2>
    <p>Hi <strong>{admin_name}</strong>,</p>
    <p>User <strong>{user_name}</strong> has submitted their work for the task: <strong>{task_title}</strong>.</p>
    <br/>
    <p>Please log in to your Admin Dashboard to review the generated outputs.</p>
    """
    return send_email(admin_email, subject, html)

def send_task_cancelled_email(to_email, task_title, admin_name):
    subject = f"Task Cancelled: {task_title}"
    html = f"""
    <h2>Task No Longer Needed</h2>
    <p>Admin <strong>{admin_name}</strong> has permanently deleted the task: <strong>{task_title}</strong>.</p>
    <br/>
    <p>You no longer need to work on this task, and it has been removed from your assigned tasks list.</p>
    """
    return send_email(to_email, subject, html)

def send_task_reassigned_email(to_email, task_title, admin_name):
    subject = f"Task Reassigned: {task_title}"
    html = f"""
    <h2>Task Reassigned</h2>
    <p>Admin <strong>{admin_name}</strong> has reassigned the task <strong>{task_title}</strong> to another user.</p>
    <br/>
    <p>You no longer need to work on this task, and it has been removed from your assigned tasks list.</p>
    """
    return send_email(to_email, subject, html)
