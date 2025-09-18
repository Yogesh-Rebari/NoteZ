# NoteZ API Documentation

This document lists REST endpoints and Socket.io events for the NoteZ application.

## Authentication

- POST `/api/auth/register`
  - Body: `{ username, email, password, firstName?, lastName? }`
  - 201: `{ status, data: { user, token } }`

- POST `/api/auth/login`
  - Body: `{ identifier, password }` // identifier is email or username
  - 200: `{ status, data: { user, token } }`

- GET `/api/auth/me` (Bearer)
  - 200: `{ status, data: { user, groups } }`

- PUT `/api/auth/me` (Bearer)
  - Body: `{ firstName?, lastName?, bio?, preferences? }`

- PUT `/api/auth/password` (Bearer)
  - Body: `{ currentPassword, newPassword }`

## Users

- GET `/api/users/profile` (Bearer)
- PUT `/api/users/profile` (Bearer)
- PUT `/api/users/password` (Bearer)
- GET `/api/users/preferences` (Bearer)
- PUT `/api/users/preferences` (Bearer)
- GET `/api/users/activity` (Bearer)
- DELETE `/api/users/account` (Bearer)

## Groups

- GET `/api/groups/public` (Bearer)
- GET `/api/groups/my-groups` (Bearer)
- POST `/api/groups` (Bearer)
- POST `/api/groups/:groupId/join` (Bearer)
- GET `/api/groups/:groupId` (Bearer, member)
- PUT `/api/groups/:groupId` (Bearer, admin/co-admin)
- DELETE `/api/groups/:groupId` (Bearer, admin)
- GET `/api/groups/:groupId/members` (Bearer, member)
- POST `/api/groups/:groupId/invite` (Bearer, permission)
- POST `/api/groups/accept-invitation` (Bearer)
- DELETE `/api/groups/:groupId/members/:memberId` (Bearer, admin/co-admin)
- PUT `/api/groups/:groupId/members/:memberId` (Bearer, admin/co-admin)
- GET `/api/groups/:groupId/subgroups` (Bearer, member)

## Notes

- GET `/api/notes/groups/:groupId` (Bearer, member)
- GET `/api/notes/groups/:groupId/search?q=...` (Bearer, member)
- GET `/api/notes/groups/:groupId/popular` (Bearer, member)
- POST `/api/notes/groups/:groupId` (Bearer, permission)
- GET `/api/notes/:noteId` (Bearer, member)
- PUT `/api/notes/:noteId` (Bearer, author or collaborator)
- DELETE `/api/notes/:noteId` (Bearer, author or group admin)
- POST `/api/notes/:noteId/like` (Bearer, member)
- POST `/api/notes/:noteId/comments` (Bearer, member)
- POST `/api/notes/:noteId/collaborators` (Bearer, author/editor)
- POST `/api/notes/:noteId/pin` (Bearer, admin/co-admin)
- POST `/api/notes/:noteId/archive` (Bearer, author/editor)

## Chat

- GET `/api/chat/:groupId/messages` (Bearer, member)
- POST `/api/chat/:groupId/messages` (Bearer, member)
- POST `/api/chat/:groupId/polls` (Bearer, member)
- POST `/api/chat/messages/:messageId/react` (Bearer, member)
- PUT `/api/chat/messages/:messageId` (Bearer, author)
- DELETE `/api/chat/messages/:messageId` (Bearer, author/admin)
- POST `/api/chat/messages/:messageId/vote` (Bearer, member)
- POST `/api/chat/:groupId/messages/read` (Bearer, member)
- GET `/api/chat/:groupId/search?query=...` (Bearer, member)
- GET `/api/chat/:groupId/stats` (Bearer, member)

## Notifications

- GET `/api/notifications` (Bearer)
- PUT `/api/notifications/:id/read` (Bearer)
- PUT `/api/notifications/mark-all-read` (Bearer)
- DELETE `/api/notifications/:id` (Bearer)

## AI

- GET `/api/ai/status` (Bearer)
- POST `/api/ai/chat/:groupId` (Bearer, member; group AI enabled)
  - Body: `{ message, personality?, studyMode? }`
- POST `/api/ai/summary/:noteId` (Bearer)
- POST `/api/ai/quiz/:noteId` (Bearer)
- POST `/api/ai/keywords/:noteId` (Bearer)
- POST `/api/ai/sentiment/:noteId` (Bearer)
- POST `/api/ai/suggestions/:groupId` (Bearer, member; group AI enabled)
- POST `/api/ai/improvements/:noteId` (Bearer)
- POST `/api/ai/process/:noteId` (Bearer)

## Uploads

- POST `/api/uploads/images` (Bearer, multipart/form-data)
- POST `/api/uploads/documents` (Bearer, multipart/form-data)

## Socket.io Events

- Auth: pass `{ token: <JWT> }` in `io(..., { auth })`.

- Connection lifecycle
  - Client emits `join_group` `{ groupId }`
  - Client emits `leave_group` `{ groupId }`

- Chat
  - Client emits `send_message` `{ groupId, content, type?, attachments? }`
  - Server emits `new_message` `{ message }`
  - Client emits `typing_start` `{ groupId }`, `typing_stop` `{ groupId }`
  - Server emits `user_typing`, `user_stopped_typing` `{ user, groupId }`
  - Server emits `recent_messages` `{ messages }` on join

- Notes
  - Server emits `new_note` `{ note, createdBy }`
  - Server emits `note_updated` `{ noteId, changes, updatedBy }`

- Notifications
  - Server emits `notification` `{ title, message, type, ... }`
  - Server emits `group_notification` to `group_<id>`

Security: Use HTTPS, set `CORS_ORIGIN` to frontend URL, set `JWT_SECRET`, `MONGODB_URI`, and `OPENAI_API_KEY` in environment.

## Security Notes
- Use HTTPS in production for both frontend and backend.
- Set strict CORS origins; avoid wildcards in production.
- Keep secrets in environment variables; never commit them.
- Validate and sanitize all inputs; avoid direct string interpolation into queries.


