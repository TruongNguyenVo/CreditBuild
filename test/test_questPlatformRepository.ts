//npx tsx test/test_questPlatformRepository.ts
/**
 * Test file for QuestPlatformRepository
 * Kiểm tra tất cả các hàm trong repository
 * 
 * Chạy: npx tsx test/test_questPlatformRepository.ts
 * 
 * Yêu cầu env:
 *   - RPC_URL: URL của node RPC
 *   - CONTRACT_ADDRESS: Địa chỉ QuestPlatform contract
 *   - WALLET_PRIVATE_KEY: Private key có quyền (ADMIN hoặc OPERATOR)
 */

import { QuestPlatformRepository } from '@/repositories/questPlatformRepository';
import type { Hash } from 'viem';

// ============================================
// HELPER FUNCTIONS
// ============================================

const divider = () => console.log('\n' + '='.repeat(60) + '\n');
const sectionTitle = (title: string) => {
  divider();
  console.log(`📌 ${title}`);
  divider();
};

const logSuccess = (fn: string, result: unknown) => {
  console.log(`✅ ${fn}:`, result);
};

const logError = (fn: string, error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.log(`❌ ${fn}: ${message}`);
};

// Test user address (thay bằng địa chỉ thực nếu cần)
const TEST_USER = '0x5D0076ed6CfF3e9974FA81c6D1471DD155261Ca7';

// ============================================
// MAIN TEST RUNNER
// ============================================

(async () => {
  console.log('🚀 Starting QuestPlatformRepository Tests...\n');
  console.log('📅 Timestamp:', new Date().toISOString());

  const repo = new QuestPlatformRepository();

  // ============================================
  // 1. TEST READ FUNCTIONS
  // ============================================
  sectionTitle('1. READ FUNCTIONS (View/Pure - không tốn gas)');

  // 1.1 DEFAULT_ADMIN_ROLE
  try {
    const adminRole = await repo.DEFAULT_ADMIN_ROLE();
    logSuccess('DEFAULT_ADMIN_ROLE()', adminRole);
  } catch (e) {
    logError('DEFAULT_ADMIN_ROLE()', e);
  }

  // 1.2 OPERATOR_ROLE
  let operatorRole: Hash | undefined;
  try {
    operatorRole = await repo.OPERATOR_ROLE();
    logSuccess('OPERATOR_ROLE()', operatorRole);
  } catch (e) {
    logError('OPERATOR_ROLE()', e);
  }

  // 1.3 PAUSER_ROLE
  try {
    const pauserRole = await repo.PAUSER_ROLE();
    logSuccess('PAUSER_ROLE()', pauserRole);
  } catch (e) {
    logError('PAUSER_ROLE()', e);
  }

  // 1.4 paused
  try {
    const isPaused = await repo.paused();
    logSuccess('paused()', isPaused);
  } catch (e) {
    logError('paused()', e);
  }

  // 1.5 pointsToken
  try {
    const tokenAddress = await repo.pointsToken();
    logSuccess('pointsToken()', tokenAddress);
  } catch (e) {
    logError('pointsToken()', e);
  }

  // 1.6 questCount
  let currentQuestCount: bigint = 0n;
  try {
    currentQuestCount = await repo.questCount();
    logSuccess('questCount()', currentQuestCount.toString());
  } catch (e) {
    logError('questCount()', e);
  }

  // 1.7 getQuest (nếu có quest)
  if (currentQuestCount > 0n) {
    try {
      const quest = await repo.getQuest(0n); // Quest ID 0
      logSuccess('getQuest(0n)', JSON.stringify(quest, (_, v) => 
        typeof v === 'bigint' ? v.toString() : v
      ));
    } catch (e) {
      logError('getQuest(0n)', e);
    }
  } else {
    console.log('⚠️ getQuest(): Skipped - No quests exist yet');
  }

  // 1.8 hasCompletedQuest
  try {
    const hasCompleted = await repo.hasCompletedQuest(TEST_USER, 0n);
    logSuccess(`hasCompletedQuest('${TEST_USER}', 0n)`, hasCompleted);
  } catch (e) {
    logError('hasCompletedQuest()', e);
  }

  // 1.9 getUserNonce
  try {
    const nonce = await repo.getUserNonce(TEST_USER);
    logSuccess(`getUserNonce('${TEST_USER}')`, nonce.toString());
  } catch (e) {
    logError('getUserNonce()', e);
  }

  // 1.10 getMessageHash
  try {
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now
    const messageHash = await repo.getMessageHash(TEST_USER, 0n, 0n, deadline);
    logSuccess('getMessageHash()', messageHash);
  } catch (e) {
    logError('getMessageHash()', e);
  }

  // 1.11 hasRole
  if (operatorRole) {
    try {
      const hasOpRole = await repo.hasRole(operatorRole, TEST_USER);
      logSuccess(`hasRole(OPERATOR_ROLE, '${TEST_USER}')`, hasOpRole);
    } catch (e) {
      logError('hasRole()', e);
    }
  }

  // ============================================
  // 2. TEST WRITE FUNCTIONS
  // ============================================
  sectionTitle('2. WRITE FUNCTIONS (State-changing - tốn gas)');
  console.log('⚠️ Lưu ý: Các hàm write cần quyền phù hợp (ADMIN/OPERATOR/PAUSER)\n');

  // 2.1 createQuest (cần OPERATOR_ROLE)
  let newQuestId: bigint | undefined;
  try {
    console.log('📝 Testing createQuest()...');
    const createHash = await repo.createQuest(
      `Test Quest ${Date.now()}`,  // unique name
      BigInt(100),                 // pointsReward
      BigInt(50),                  // creditImpact
      BigInt(0)                    // maxCompletions (0 = unlimited)
    );
    logSuccess('createQuest()', createHash);
    
    // Lấy quest count mới để biết ID
    const newCount = await repo.questCount();
    newQuestId = newCount - 1n;
    console.log(`   → New quest ID: ${newQuestId}`);
    
    // Verify quest được tạo
    const createdQuest = await repo.getQuest(newQuestId);
    console.log('   → Quest details:', JSON.stringify(createdQuest, (_, v) => 
      typeof v === 'bigint' ? v.toString() : v
    ));
  } catch (e) {
    logError('createQuest()', e);
  }

  // 2.2 setQuestActive (cần OPERATOR_ROLE)
  if (newQuestId !== undefined) {
    try {
      console.log('\n📝 Testing setQuestActive()...');
      const setActiveHash = await repo.setQuestActive(newQuestId, false);
      logSuccess(`setQuestActive(${newQuestId}, false)`, setActiveHash);
      
      // Verify
      const quest = await repo.getQuest(newQuestId);
      console.log(`   → Quest isActive: ${quest.isActive}`);
      
      // Bật lại
      await repo.setQuestActive(newQuestId, true);
      console.log('   → Re-activated quest');
    } catch (e) {
      logError('setQuestActive()', e);
    }
  } else {
    console.log('\n⚠️ setQuestActive(): Skipped - No quest created');
  }

  // 2.3 completeQuestForUser (cần OPERATOR_ROLE)
  if (newQuestId !== undefined) {
    try {
      console.log('\n📝 Testing completeQuestForUser()...');
      const completeHash = await repo.completeQuestForUser(TEST_USER, newQuestId);
      logSuccess(`completeQuestForUser('${TEST_USER}', ${newQuestId})`, completeHash);
      
      // Verify
      const hasCompleted = await repo.hasCompletedQuest(TEST_USER, newQuestId);
      console.log(`   → hasCompletedQuest: ${hasCompleted}`);
    } catch (e) {
      logError('completeQuestForUser()', e);
    }
  } else {
    console.log('\n⚠️ completeQuestForUser(): Skipped - No quest created');
  }

  // 2.4 batchCompleteQuests (cần OPERATOR_ROLE)
  // Tạo thêm quest mới để test batch
  try {
    console.log('\n📝 Testing batchCompleteQuests()...');
    
    // Tạo 2 quest mới cho batch test
    await repo.createQuest('Batch Test Quest 1', BigInt(50), BigInt(25), BigInt(0));
    await repo.createQuest('Batch Test Quest 2', BigInt(75), BigInt(30), BigInt(0));
    
    const count = await repo.questCount();
    const quest1Id = count - 2n;
    const quest2Id = count - 1n;
    
    // Batch complete
    const batchHash = await repo.batchCompleteQuests(
      [TEST_USER, TEST_USER],
      [quest1Id, quest2Id]
    );
    logSuccess('batchCompleteQuests()', batchHash);
    
    // Verify
    const completed1 = await repo.hasCompletedQuest(TEST_USER, quest1Id);
    const completed2 = await repo.hasCompletedQuest(TEST_USER, quest2Id);
    console.log(`   → Quest ${quest1Id} completed: ${completed1}`);
    console.log(`   → Quest ${quest2Id} completed: ${completed2}`);
  } catch (e) {
    logError('batchCompleteQuests()', e);
  }

  // 2.5 grantRole (cần DEFAULT_ADMIN_ROLE)
  if (operatorRole) {
    try {
      console.log('\n📝 Testing grantRole()...');
      // Grant OPERATOR_ROLE to a test address
      const testGrantAddress = '0x0000000000000000000000000000000000000001';
      
      // Check current role status
      const hadRoleBefore = await repo.hasRole(operatorRole, testGrantAddress);
      console.log(`   → Before grant: hasRole = ${hadRoleBefore}`);
      
      const grantHash = await repo.grantRole(operatorRole, testGrantAddress);
      logSuccess(`grantRole(OPERATOR_ROLE, '${testGrantAddress}')`, grantHash);
      
      // Verify
      const hasRoleAfter = await repo.hasRole(operatorRole, testGrantAddress);
      console.log(`   → After grant: hasRole = ${hasRoleAfter}`);
    } catch (e) {
      logError('grantRole()', e);
    }
  } else {
    console.log('\n⚠️ grantRole(): Skipped - Could not get OPERATOR_ROLE');
  }

  // 2.6 revokeRole (cần DEFAULT_ADMIN_ROLE)
  if (operatorRole) {
    try {
      console.log('\n📝 Testing revokeRole()...');
      const testRevokeAddress = '0x0000000000000000000000000000000000000001';
      
      const revokeHash = await repo.revokeRole(operatorRole, testRevokeAddress);
      logSuccess(`revokeRole(OPERATOR_ROLE, '${testRevokeAddress}')`, revokeHash);
      
      // Verify
      const hasRoleAfter = await repo.hasRole(operatorRole, testRevokeAddress);
      console.log(`   → After revoke: hasRole = ${hasRoleAfter}`);
    } catch (e) {
      logError('revokeRole()', e);
    }
  } else {
    console.log('\n⚠️ revokeRole(): Skipped - Could not get OPERATOR_ROLE');
  }

  // 2.7 pause (cần PAUSER_ROLE)
  try {
    console.log('\n📝 Testing pause()...');
    const isPausedBefore = await repo.paused();
    
    if (!isPausedBefore) {
      const pauseHash = await repo.pause();
      logSuccess('pause()', pauseHash);
      
      const isPausedAfter = await repo.paused();
      console.log(`   → Contract paused: ${isPausedAfter}`);
    } else {
      console.log('   → Contract already paused, skipping pause test');
    }
  } catch (e) {
    logError('pause()', e);
  }

  // 2.8 unpause (cần PAUSER_ROLE)
  try {
    console.log('\n📝 Testing unpause()...');
    const isPausedBefore = await repo.paused();
    
    if (isPausedBefore) {
      const unpauseHash = await repo.unpause();
      logSuccess('unpause()', unpauseHash);
      
      const isPausedAfter = await repo.paused();
      console.log(`   → Contract paused: ${isPausedAfter}`);
    } else {
      console.log('   → Contract not paused, skipping unpause test');
    }
  } catch (e) {
    logError('unpause()', e);
  }

  // 2.9 setPointsToken (cần DEFAULT_ADMIN_ROLE)
  // ⚠️ CẢNH BÁO: Không nên test trên production vì sẽ thay đổi token address
  try {
    console.log('\n📝 Testing setPointsToken()...');
    console.log('   ⚠️ SKIPPED: This would change the PointsToken address');
    console.log('   → Use with caution in production!');
    // Uncomment để test (chỉ khi biết mình đang làm gì):
    // const newTokenAddress = '0x...';
    // const setTokenHash = await repo.setPointsToken(newTokenAddress);
    // logSuccess('setPointsToken()', setTokenHash);
  } catch (e) {
    logError('setPointsToken()', e);
  }

  // 2.10 claimWithAttestation (user tự claim với signature)
  try {
    console.log('\n📝 Testing claimWithAttestation()...');
    console.log('   ⚠️ SKIPPED: Requires valid operator signature');
    console.log('   → Need to generate signature off-chain first');
    // Để test cần:
    // 1. Tạo quest mới
    // 2. Lấy messageHash từ getMessageHash()
    // 3. Sign hash đó bằng operator private key
    // 4. Gọi claimWithAttestation với signature
  } catch (e) {
    logError('claimWithAttestation()', e);
  }

  // ============================================
  // 3. TEST UTILITY FUNCTIONS
  // ============================================
  sectionTitle('3. UTILITY FUNCTIONS');

  // 3.1 getTransactionReceipt
  try {
    console.log('📝 Testing getTransactionReceipt()...');
    
    // Tạo một transaction để lấy receipt
    const txHash = await repo.createQuest(
      `Receipt Test ${Date.now()}`,
      BigInt(10),
      BigInt(5),
      BigInt(0)
    );
    
    const receipt = await repo.getTransactionReceipt(txHash);
    logSuccess('getTransactionReceipt()', {
      status: receipt.status,
      blockNumber: receipt.blockNumber.toString(),
      gasUsed: receipt.gasUsed.toString(),
      transactionHash: receipt.transactionHash,
    });
  } catch (e) {
    logError('getTransactionReceipt()', e);
  }

  // ============================================
  // SUMMARY
  // ============================================
  sectionTitle('TEST SUMMARY');
  
  const finalQuestCount = await repo.questCount();
  console.log(`📊 Final quest count: ${finalQuestCount}`);
  console.log('\n✅ All tests completed!');
  console.log('📅 Finished at:', new Date().toISOString());

})().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
