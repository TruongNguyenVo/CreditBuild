// src/repositories/QuestPlatformRepository.ts
import QuestPlatformABI from "@/contracts/QuestPlatform.json";
import * as dotenv from "dotenv";
import {
    createPublicClient,
    createWalletClient,
    getContract,
    http,
    type Address,
    type Hash,
    type PublicClient,
    type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { creditCoin3Testnet } from "viem/chains";
dotenv.config();

/**
 * QuestPlatformRepository
 * Repository để tương tác với QuestPlatform smart contract
 * Sử dụng viem
 */
export class QuestPlatformRepository {
  private contractAddress: Address;
  private publicClient: PublicClient;
  private walletClient?: WalletClient;
  private account?: Address;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contract: any;

  constructor() {
    this.contractAddress = process.env.CONTRACT_ADDRESS as Address;
    const rpcUrl = process.env.RPC_URL;

    // Khởi tạo public client (cho read operations)
    if (!rpcUrl) {
      throw new Error("RPC_URL is required in environment variables");
    }
    this.publicClient = createPublicClient({
      chain: creditCoin3Testnet,
      transport: http(rpcUrl),
    });

    // Nếu có private key thì tạo wallet client (cho write operations)
    const privateKey = process.env.WALLET_PRIVATE_KEY;
    if (privateKey) {
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      this.account = account.address;

      this.walletClient = createWalletClient({
        account,
        chain: creditCoin3Testnet,
        transport: http(rpcUrl),
      });
    } else {
      throw new Error("WALLET_PRIVATE_KEY is required in environment variables for write operations");
    }

    this.contract = getContract({
      address: this.contractAddress,
      abi: QuestPlatformABI,
      client: this.walletClient || this.publicClient, // dùng signer nếu có
    });
  }

  // ============================================
  // READ FUNCTIONS (View/Pure - không tốn gas)
  // ============================================

  /**
   * DEFAULT_ADMIN_ROLE: Lấy role hash của admin
   * Input: none
   * Output: Hash (bytes32 hash của admin role)
   * Mã giả:
   *   1. Gọi contract.read.DEFAULT_ADMIN_ROLE()
   *   2. Return role hash
   */
  async DEFAULT_ADMIN_ROLE(): Promise<Hash> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: QuestPlatformABI,
      functionName: "DEFAULT_ADMIN_ROLE",
    });
    return result as Hash;
  }

  /**
   * OPERATOR_ROLE: Lấy role hash của operator
   * Input: none
   * Output: Hash (bytes32 hash của operator role)
   * Mã giả:
   *   1. Gọi contract.read.OPERATOR_ROLE()
   *   2. Return role hash
   */
  async OPERATOR_ROLE(): Promise<Hash> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: QuestPlatformABI,
      functionName: "OPERATOR_ROLE",
    });
    return result as Hash;
  }

  /**
   * PAUSER_ROLE: Lấy role hash của pauser
   * Input: none
   * Output: Hash (bytes32 hash của pauser role)
   * Mã giả:
   *   1. Gọi contract.read.PAUSER_ROLE()
   *   2. Return role hash
   */
  async PAUSER_ROLE(): Promise<Hash> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: QuestPlatformABI,
      functionName: "PAUSER_ROLE",
    });
    return result as Hash;
  }

  /**
   * paused: Kiểm tra contract có bị pause không
   * Input: none
   * Output: boolean (true nếu đang pause)
   * Mã giả:
   *   1. Gọi contract.read.paused()
   *   2. Return true/false
   */
  async paused(): Promise<boolean> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: QuestPlatformABI,
      functionName: "paused",
    });
    return result as boolean;
  }

  /**
   * pointsToken: Lấy địa chỉ của PointsToken contract
   * Input: none
   * Output: Address (địa chỉ contract của PointsToken)
   * Mã giả:
   *   1. Gọi contract.read.pointsToken()
   *   2. Return address
   */
  async pointsToken(): Promise<Address> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: QuestPlatformABI,
      functionName: "pointsToken",
    });
    return result as Address;
  }

  /**
   * questCount: Lấy tổng số quest đã tạo
   * Input: none
   * Output: bigint (số lượng quest)
   * Mã giả:
   *   1. Gọi contract.read.questCount()
   *   2. Return count
   */
  async questCount(): Promise<bigint> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: QuestPlatformABI,
      functionName: "questCount",
    });
    return result as bigint;
  }

  /**
   * getQuest: Lấy thông tin quest theo ID
   * Input: questId (bigint) - ID của quest
   * Output: object {name, pointsReward, creditImpact, isActive, maxCompletions, currentCompletions}
   * Mã giả:
   *   1. Gọi contract.read.getQuest(questId)
   *   2. Return quest info
   */
  async getQuest(questId: bigint): Promise<{
    name: string;
    pointsReward: bigint;
    creditImpact: bigint;
    isActive: boolean;
    maxCompletions: bigint;
    currentCompletions: bigint;
  }> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: QuestPlatformABI,
      functionName: "getQuest",
      args: [questId],
    });
    const [name, pointsReward, creditImpact, isActive, maxCompletions, currentCompletions] = result as [
      string,
      bigint,
      bigint,
      boolean,
      bigint,
      bigint
    ];
    return { name, pointsReward, creditImpact, isActive, maxCompletions, currentCompletions };
  }

  /**
   * hasCompletedQuest: Kiểm tra user đã hoàn thành quest chưa
   * Input:
   *   - user (string): địa chỉ user
   *   - questId (bigint): ID của quest
   * Output: boolean (true nếu đã hoàn thành)
   * Mã giả:
   *   1. Gọi contract.read.hasCompletedQuest(user, questId)
   *   2. Return true/false
   */
  async hasCompletedQuest(user: string, questId: bigint): Promise<boolean> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: QuestPlatformABI,
      functionName: "hasCompletedQuest",
      args: [user as Address, questId],
    });
    return result as boolean;
  }

  /**
   * getUserNonce: Lấy nonce của user (cho attestation)
   * Input: user (string) - địa chỉ user
   * Output: bigint (nonce hiện tại)
   * Mã giả:
   *   1. Gọi contract.read.getUserNonce(user)
   *   2. Return nonce
   */
  async getUserNonce(user: string): Promise<bigint> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: QuestPlatformABI,
      functionName: "getUserNonce",
      args: [user as Address],
    });
    return result as bigint;
  }

  /**
   * getMessageHash: Tạo message hash cho attestation
   * Input:
   *   - user (string): địa chỉ user
   *   - questId (bigint): ID quest
   *   - nonce (bigint): nonce của user
   *   - deadline (bigint): thời hạn (timestamp)
   * Output: Hash (message hash)
   * Mã giả:
   *   1. Gọi contract.read.getMessageHash(user, questId, nonce, deadline)
   *   2. Return hash để sign
   */
  async getMessageHash(
    user: string,
    questId: bigint,
    nonce: bigint,
    deadline: bigint
  ): Promise<Hash> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: QuestPlatformABI,
      functionName: "getMessageHash",
      args: [user as Address, questId, nonce, deadline],
    });
    return result as Hash;
  }

  /**
   * hasRole: Kiểm tra xem address có role không
   * Input:
   *   - role (Hash): role hash (bytes32)
   *   - account (string): địa chỉ cần check
   * Output: boolean (true nếu có role)
   * Mã giả:
   *   1. Gọi contract.read.hasRole(role, account)
   *   2. Return true/false
   */
  async hasRole(role: Hash, account: string): Promise<boolean> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: QuestPlatformABI,
      functionName: "hasRole",
      args: [role, account as Address],
    });
    return result as boolean;
  }

  // ============================================
  // WRITE FUNCTIONS (State-changing - tốn gas)
  // Cần wallet client (private key)
  // ============================================

  /**
   * createQuest: Tạo quest mới (cần OPERATOR_ROLE)
   * Input:
   *   - name (string): tên quest
   *   - pointsReward (bigint): số points thưởng
   *   - creditImpact (bigint): tác động lên credit score
   *   - maxCompletions (bigint): số lần hoàn thành tối đa (0 = unlimited)
   * Output: Hash (transaction hash)
   * Mã giả:
   *   1. Check wallet client exists
   *   2. Check caller có OPERATOR_ROLE
   *   3. Gọi contract.write.createQuest(name, pointsReward, creditImpact, maxCompletions)
   *   4. Wait for confirmation
   *   5. Emit QuestCreated event
   *   6. Return tx hash
   */
  async createQuest(
    name: string,
    pointsReward: bigint,
    creditImpact: bigint,
    maxCompletions: bigint
  ): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet client required for write operations");
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      chain: creditCoin3Testnet,
      abi: QuestPlatformABI,
      functionName: "createQuest",
      args: [name, pointsReward, creditImpact, maxCompletions],
      account: this.account,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * completeQuestForUser: Hoàn thành quest cho user (cần OPERATOR_ROLE)
   * Input:
   *   - user (string): địa chỉ user
   *   - questId (bigint): ID quest
   * Output: Hash (transaction hash)
   * Mã giả:
   *   1. Check wallet client exists
   *   2. Check caller có OPERATOR_ROLE
   *   3. Check quest exists và active
   *   4. Check user chưa hoàn thành quest
   *   5. Gọi contract.write.completeQuestForUser(user, questId)
   *   6. Mint points cho user
   *   7. Emit QuestCompleted event
   *   8. Return tx hash
   */
  async completeQuestForUser(user: string, questId: bigint): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet client required for write operations");
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      chain: creditCoin3Testnet,
      abi: QuestPlatformABI,
      functionName: "completeQuestForUser",
      args: [user as Address, questId],
      account: this.account,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * batchCompleteQuests: Hoàn thành nhiều quest cho nhiều user (cần OPERATOR_ROLE)
   * Input:
   *   - users (string[]): mảng địa chỉ users
   *   - questIds (bigint[]): mảng quest IDs tương ứng
   * Output: Hash (transaction hash)
   * Mã giả:
   *   1. Check wallet client exists
   *   2. Check users.length === questIds.length
   *   3. Gọi contract.write.batchCompleteQuests(users, questIds)
   *   4. Wait for confirmation
   *   5. Return tx hash
   */
  async batchCompleteQuests(users: string[], questIds: bigint[]): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet client required for write operations");
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      chain: creditCoin3Testnet,
      abi: QuestPlatformABI,
      functionName: "batchCompleteQuests",
      args: [users as Address[], questIds],
      account: this.account,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * claimWithAttestation: User tự claim quest bằng signature
   * Input:
   *   - questId (bigint): ID quest
   *   - nonce (bigint): nonce của user
   *   - deadline (bigint): thời hạn (timestamp)
   *   - signature (string): chữ ký từ operator
   * Output: Hash (transaction hash)
   * Mã giả:
   *   1. Check wallet client exists
   *   2. Verify signature từ operator
   *   3. Check deadline chưa hết hạn
   *   4. Check nonce hợp lệ
   *   5. Gọi contract.write.claimWithAttestation(questId, nonce, deadline, signature)
   *   6. Mint points cho user
   *   7. Emit QuestCompletedWithAttestation event
   *   8. Return tx hash
   */
  async claimWithAttestation(
    questId: bigint,
    nonce: bigint,
    deadline: bigint,
    signature: string
  ): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet client required for write operations");
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      chain: creditCoin3Testnet,
      abi: QuestPlatformABI,
      functionName: "claimWithAttestation",
      args: [questId, nonce, deadline, signature as `0x${string}`],
      account: this.account,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * setQuestActive: Bật/tắt quest (cần OPERATOR_ROLE)
   * Input:
   *   - questId (bigint): ID quest
   *   - isActive (boolean): trạng thái mới
   * Output: Hash (transaction hash)
   * Mã giả:
   *   1. Check wallet client exists
   *   2. Check caller có OPERATOR_ROLE
   *   3. Gọi contract.write.setQuestActive(questId, isActive)
   *   4. Wait for confirmation
   *   5. Emit QuestUpdated event
   *   6. Return tx hash
   */
  async setQuestActive(questId: bigint, isActive: boolean): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet client required for write operations");
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      chain: creditCoin3Testnet,
      abi: QuestPlatformABI,
      functionName: "setQuestActive",
      args: [questId, isActive],
      account: this.account,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * setPointsToken: Thay đổi địa chỉ PointsToken (cần ADMIN_ROLE)
   * Input: newToken (string) - địa chỉ contract mới
   * Output: Hash (transaction hash)
   * Mã giả:
   *   1. Check wallet client exists
   *   2. Check caller có ADMIN_ROLE
   *   3. Gọi contract.write.setPointsToken(newToken)
   *   4. Wait for confirmation
   *   5. Emit PointsTokenUpdated event
   *   6. Return tx hash
   */
  async setPointsToken(newToken: string): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet client required for write operations");
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      chain: creditCoin3Testnet,
      abi: QuestPlatformABI,
      functionName: "setPointsToken",
      args: [newToken as Address],
      account: this.account,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * grantRole: Cấp role cho account (cần ADMIN_ROLE)
   * Input:
   *   - role (Hash): role hash (bytes32)
   *   - account (string): địa chỉ nhận role
   * Output: Hash (transaction hash)
   * Mã giả:
   *   1. Check wallet client exists
   *   2. Check caller có ADMIN_ROLE
   *   3. Gọi contract.write.grantRole(role, account)
   *   4. Wait for confirmation
   *   5. Emit RoleGranted event
   *   6. Return tx hash
   */
  async grantRole(role: Hash, account: string): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet client required for write operations");
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      chain: creditCoin3Testnet,
      abi: QuestPlatformABI,
      functionName: "grantRole",
      args: [role, account as Address],
      account: this.account,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * revokeRole: Thu hồi role từ account (cần ADMIN_ROLE)
   * Input:
   *   - role (Hash): role hash (bytes32)
   *   - account (string): địa chỉ bị thu hồi role
   * Output: Hash (transaction hash)
   * Mã giả:
   *   1. Check wallet client exists
   *   2. Check caller có ADMIN_ROLE
   *   3. Gọi contract.write.revokeRole(role, account)
   *   4. Wait for confirmation
   *   5. Emit RoleRevoked event
   *   6. Return tx hash
   */
  async revokeRole(role: Hash, account: string): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet client required for write operations");
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      chain: creditCoin3Testnet,
      abi: QuestPlatformABI,
      functionName: "revokeRole",
      args: [role, account as Address],
      account: this.account,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * pause: Tạm dừng contract (cần PAUSER_ROLE)
   * Input: none
   * Output: Hash (transaction hash)
   * Mã giả:
   *   1. Check wallet client exists
   *   2. Check caller có PAUSER_ROLE
   *   3. Check contract chưa pause
   *   4. Gọi contract.write.pause()
   *   5. Wait for confirmation
   *   6. Emit Paused event
   *   7. Return tx hash
   */
  async pause(): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet client required for write operations");
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      chain: creditCoin3Testnet,
      abi: QuestPlatformABI,
      functionName: "pause",
      account: this.account,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * unpause: Mở lại contract (cần PAUSER_ROLE)
   * Input: none
   * Output: Hash (transaction hash)
   * Mã giả:
   *   1. Check wallet client exists
   *   2. Check caller có PAUSER_ROLE
   *   3. Check contract đang pause
   *   4. Gọi contract.write.unpause()
   *   5. Wait for confirmation
   *   6. Emit Unpaused event
   *   7. Return tx hash
   */
  async unpause(): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet client required for write operations");
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      chain: creditCoin3Testnet,
      abi: QuestPlatformABI,
      functionName: "unpause",
      account: this.account,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * getTransactionReceipt: Lấy receipt của transaction
   * Input: hash (Hash) - transaction hash
   * Output: TransactionReceipt
   * Mã giả:
   *   1. Gọi publicClient.getTransactionReceipt(hash)
   *   2. Return receipt với status, blockNumber, gasUsed, logs
   */
  async getTransactionReceipt(hash: Hash) {
    return await this.publicClient.getTransactionReceipt({ hash });
  }
}

// ============================================
// USAGE EXAMPLE
// ============================================
/*
// Import
import { QuestPlatformRepository } from '@/repositories/QuestPlatformRepository';

// 1. READ-ONLY (không cần private key)
const repo = new QuestPlatformRepository();

// Đọc thông tin
const questCount = await repo.questCount(); // bigint
const quest = await repo.getQuest(1n); // {name, pointsReward, creditImpact, isActive, ...}
const hasCompleted = await repo.hasCompletedQuest('0xUserAddress', 1n); // true/false
const userNonce = await repo.getUserNonce('0xUserAddress'); // bigint

// Check roles
const operatorRole = await repo.OPERATOR_ROLE(); // role hash
const isPaused = await repo.paused(); // true/false

// 2. WITH WALLET (cần OPERATOR_PRIVATE_KEY)
const repoWithWallet = new QuestPlatformRepository();

// Tạo quest mới (cần OPERATOR_ROLE)
const createHash = await repoWithWallet.createQuest(
  "Complete KYC",           // name
  100n,                     // pointsReward (100 points)
  50n,                      // creditImpact (+50 credit score)
  0n                        // maxCompletions (0 = unlimited)
);
console.log('Quest created! Tx hash:', createHash);

// Hoàn thành quest cho user (cần OPERATOR_ROLE)
const completeHash = await repoWithWallet.completeQuestForUser(
  '0xUserAddress',
  1n  // questId
);
console.log('Quest completed for user! Tx hash:', completeHash);

// Batch complete quests
const batchHash = await repoWithWallet.batchCompleteQuests(
  ['0xUser1', '0xUser2', '0xUser3'],
  [1n, 2n, 1n]  // questIds tương ứng
);

// User tự claim với attestation
const claimHash = await repoWithWallet.claimWithAttestation(
  1n,                      // questId
  0n,                      // nonce
  1735689600n,            // deadline (timestamp)
  '0x...'                 // signature từ operator
);

// Bật/tắt quest (cần OPERATOR_ROLE)
const toggleHash = await repoWithWallet.setQuestActive(1n, false);

// Get transaction receipt
const receipt = await repoWithWallet.getTransactionReceipt(createHash);
console.log('Status:', receipt.status); // 'success' hoặc 'reverted'
console.log('Block:', receipt.blockNumber);
console.log('Gas used:', receipt.gasUsed);
*/