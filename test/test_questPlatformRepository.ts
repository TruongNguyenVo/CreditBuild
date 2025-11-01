
// Import
import { QuestPlatformRepository } from '@/repositories/questPlatformRepository';

// Wrap everything inside an async IIFE
(async () => {
  // 1. READ-ONLY (không cần private key)
  const repo = new QuestPlatformRepository();

  // Đọc thông tin
  const questCount = await repo.questCount(); // bigint
  console.log('Total quests:', questCount);

    // Tạo quest mới (cần OPERATOR_ROLE)
    const createHash = await repo.createQuest(
    "Complete KYC",           // name
    BigInt(100),              // pointsReward (100 points)
    BigInt(50),               // creditImpact (+50 credit score)
    BigInt(0)                 // maxCompletions (0 = unlimited)
    );
    console.log('Quest created! Tx hash:', createHash);
})();


// const quest = await repo.getQuest(1n); // {name, pointsReward, creditImpact, isActive, ...}
// const hasCompleted = await repo.hasCompletedQuest('0xUserAddress', 1n); // true/false
// const userNonce = await repo.getUserNonce('0xUserAddress'); // bigint

// // Check roles
// const operatorRole = await repo.OPERATOR_ROLE(); // role hash
// const isPaused = await repo.paused(); // true/false

// // 2. WITH WALLET (cần OPERATOR_PRIVATE_KEY)
// const repoWithWallet = new QuestPlatformRepository();

// // Tạo quest mới (cần OPERATOR_ROLE)
// const createHash = await repoWithWallet.createQuest(
//   "Complete KYC",           // name
//   100n,                     // pointsReward (100 points)
//   50n,                      // creditImpact (+50 credit score)
//   0n                        // maxCompletions (0 = unlimited)
// );
// console.log('Quest created! Tx hash:', createHash);

// // Hoàn thành quest cho user (cần OPERATOR_ROLE)
// const completeHash = await repoWithWallet.completeQuestForUser(
//   '0xUserAddress',
//   1n  // questId
// );
// console.log('Quest completed for user! Tx hash:', completeHash);

// // Batch complete quests
// const batchHash = await repoWithWallet.batchCompleteQuests(
//   ['0xUser1', '0xUser2', '0xUser3'],
//   [1n, 2n, 1n]  // questIds tương ứng
// );

// // User tự claim với attestation
// const claimHash = await repoWithWallet.claimWithAttestation(
//   1n,                      // questId
//   0n,                      // nonce
//   1735689600n,            // deadline (timestamp)
//   '0x...'                 // signature từ operator
// );

// // Bật/tắt quest (cần OPERATOR_ROLE)
// const toggleHash = await repoWithWallet.setQuestActive(1n, false);

// // Get transaction receipt
// const receipt = await repoWithWallet.getTransactionReceipt(createHash);
// console.log('Status:', receipt.status); // 'success' hoặc 'reverted'
// console.log('Block:', receipt.blockNumber);
// console.log('Gas used:', receipt.gasUsed);
