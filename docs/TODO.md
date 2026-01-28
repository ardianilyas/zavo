# Roadmap & Ideas

## Phase 1: Core Architecture Refactor (User vs. Creator)

### 1. Schema Separation
Refactor `User` to be purely for Authentication and `Creator` for Public Persona.
-   **User Table**: `id`, `email`, `name`, `image` (Auth only).
-   **New! Creator Table**:
    -   `id` (PK)
    -   `userId` (FK -> User.id)
    -   `username` (Unique Handle/Slug, e.g. @zavo)
    -   `bio`
    -   `streamKey` (Moved from User)
    -   `balance` (Current Wallet Balance)
    -   `theme/overlays` (Customization settings)

### 2. Multi-Profile Support
-   Allow 1 User to own up to 2 Creator Profiles.
-   Implement "Switch Profile" logic in Dashboard.
-   Session must track `activeCreatorId`.

### 3. Balance & Ledger System (High Integrity)
Prevent race conditions and ensure financial accuracy.
-   **Strategy**: Database Transactions + Row Locking.
    -   *Action*: When a donation comes in, open a transaction.
    -   *Lock*: `SELECT * FROM creator WHERE id = ? FOR UPDATE`.
    -   *Update*: `UPDATE creator SET balance = balance + amount`.
    -   *Ledger*: Insert into `transactions` table (credit).
    -   *Commit*.
-   *Alternative (High Scale)*: Async Queue (DonationReceived Event), but DB Lock is sufficient for current phase.