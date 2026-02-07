// Comment Lifecycle
//  ├── createComment
//  ├── getComments
//  ├── getReplies
//  ├── updateComment
//  ├── deleteComment
//  ├── toggleLikeComment
//  ├── reportComment
//  ├── restoreComment (admin)
//  ├── getReportedComments (admin)
//  └── getTopComments

// Your Learning Structure From Now
// Phase 1 – Create Comment
// You already understand logic.
// Next we will code it slowly.
// Phase 2 – Get Comments
// You’ll learn aggregation + pagination.
// Phase 3 – Update Comment
// Authorization + integrity.
// Phase 4 – Delete Comment
// Soft delete + counters.
// Phase 5 – Toggle Like
// Concurrency + atomic updates.
// Phase 6 – Moderation
// Platform thinking.

// One Important Rule Going Forward
// Whenever we build a controller, you will ask yourself 5 questions:
// Who can do this? (Authorization)
// What data changes? (Integrity)
// What counters change? (Performance)
// What can break? (Edge cases)
// What will scale? (Future proofing)
// If you answer these, you don’t need me.
