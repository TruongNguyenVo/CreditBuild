// src/repositories/PointsTokenRepository.ts
import PointsTokenABI from "@/lib/abi/PointsToken.json";
import dotenv from "dotenv";
import {
  createPublicClient,
  createWalletClient,
  formatUnits,
  http,
  parseUnits,
  type Address,
  type Hash,
  type PublicClient,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { creditCoin3Testnet } from "viem/chains";
dotenv.config();

/**
 * PointsTokenRepository
 * Repository để tương tác với PointsToken smart contract
 * Sử dụng viem (hiện đại hơn ethers.js)
 */
export class PointsTokenRepository {
  private contractAddress: Address;
  private publicClient: PublicClient;
  private walletClient?: WalletClient;
  private account?: Address;


  constructor() {
    this.contractAddress = process.env.CONTRACT_ADDRESS as Address;
    const rpcUrl = process.env.RPC_URL

    // Khởi tạo public client (cho read operations)
    if (!rpcUrl) {
        throw new Error("RPC_URL is not defined in environment variables");
    }
    this.publicClient = createPublicClient({
      chain: creditCoin3Testnet,
      transport: http(rpcUrl),
    });

    // Nếu có private key thì tạo wallet client (cho write operations)
    const privateKey = process.env.WALLET_PRIVATE_KEY
    if (privateKey) {
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      this.account = account.address;

      this.walletClient = createWalletClient({
        account,
        chain: creditCoin3Testnet,
        transport: http(rpcUrl),
      });
    }
    else{
        throw new Error("Private key is required for write operations");
    }
  }

  // ============================================
  // READ FUNCTIONS (View/Pure - không tốn gas)
  // ============================================

  /**
   * name: Lấy tên token
   * Input: none
   * Output: string (tên token, vd: "PointsToken")
   * Mã giả:
   *   1. Gọi contract.read.name()
   *   2. Return tên token
   */
  async name(): Promise<string> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: PointsTokenABI,
      functionName: "name",
    });
    return result as string;
  }

  /**
   * symbol: Lấy ký hiệu token
   * Input: none
   * Output: string (symbol, vd: "PTS")
   * Mã giả:
   *   1. Gọi contract.read.symbol()
   *   2. Return symbol
   */
  async symbol(): Promise<string> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: PointsTokenABI,
      functionName: "symbol",
    });
    return result as string;
  }

  /**
   * decimals: Lấy số decimal của token
   * Input: none
   * Output: number (thường là 18)
   * Mã giả:
   *   1. Gọi contract.read.decimals()
   *   2. Return số decimals
   */
  async decimals(): Promise<number> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: PointsTokenABI,
      functionName: "decimals",
    });
    return result as number;
  }

  /**
   * totalSupply: Lấy tổng supply của token
   * Input: none
   * Output: bigint (tổng số token đã mint)
   * Mã giả:
   *   1. Gọi contract.read.totalSupply()
   *   2. Return total supply (raw value, cần chia cho 10^decimals)
   */
  async totalSupply(): Promise<bigint> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: PointsTokenABI,
      functionName: "totalSupply",
    });
    return result as bigint;
  }

  /**
   * balanceOf: Lấy số dư của địa chỉ
   * Input: address (string) - địa chỉ ví cần check
   * Output: bigint (số token của address, raw value)
   * Mã giả:
   *   1. Validate address format
   *   2. Gọi contract.read.balanceOf(address)
   *   3. Return balance
   */
  async balanceOf(address: string): Promise<bigint> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: PointsTokenABI,
      functionName: "balanceOf",
      args: [address as Address],
    });
    return result as bigint;
  }

  /**
   * allowance: Kiểm tra số token được approve
   * Input:
   *   - owner (string): địa chỉ chủ sở hữu
   *   - spender (string): địa chỉ được phép xài
   * Output: bigint (số token được approve)
   * Mã giả:
   *   1. Validate owner và spender addresses
   *   2. Gọi contract.read.allowance(owner, spender)
   *   3. Return số token được approve
   */
  async allowance(owner: string, spender: string): Promise<bigint> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: PointsTokenABI,
      functionName: "allowance",
      args: [owner as Address, spender as Address],
    });
    return result as bigint;
  }

  /**
   * hasRole: Kiểm tra xem address có role không
   * Input:
   *   - role (string): role hash (bytes32)
   *   - account (string): địa chỉ cần check
   * Output: boolean (true nếu có role)
   * Mã giả:
   *   1. Gọi contract.read.hasRole(role, account)
   *   2. Return true/false
   */
  async hasRole(role: Hash, account: string): Promise<boolean> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: PointsTokenABI,
      functionName: "hasRole",
      args: [role, account as Address],
    });
    return result as boolean;
  }

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
      abi: PointsTokenABI,
      functionName: "DEFAULT_ADMIN_ROLE",
    });
    return result as Hash;
  }

  /**
   * MINTER_ROLE: Lấy role hash của minter
   * Input: none
   * Output: Hash (bytes32 hash của minter role)
   * Mã giả:
   *   1. Gọi contract.read.MINTER_ROLE()
   *   2. Return role hash
   */
  async MINTER_ROLE(): Promise<Hash> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: PointsTokenABI,
      functionName: "MINTER_ROLE",
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
      abi: PointsTokenABI,
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
      abi: PointsTokenABI,
      functionName: "paused",
    });
    return result as boolean;
  }

  /**
   * MAX_SUPPLY: Lấy max supply của token
   * Input: none
   * Output: bigint (max supply limit)
   * Mã giả:
   *   1. Gọi contract.read.MAX_SUPPLY()
   *   2. Return max supply
   */
  async MAX_SUPPLY(): Promise<bigint> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: PointsTokenABI,
      functionName: "MAX_SUPPLY",
    });
    return result as bigint;
  }

  /**
   * isMinter: Kiểm tra xem address có phải minter không
   * Input: account (string) - địa chỉ cần check
   * Output: boolean (true nếu là minter)
   * Mã giả:
   *   1. Gọi contract.read.isMinter(account)
   *   2. Return true/false
   */
  async isMinter(account: string): Promise<boolean> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: PointsTokenABI,
      functionName: "isMinter",
      args: [account as Address],
    });
    return result as boolean;
  }

  // ============================================
  // WRITE FUNCTIONS (State-changing - tốn gas)
  // Cần wallet client (private key)
  // ============================================

  /**
   * transfer: Chuyển token cho địa chỉ khác
   * Input:
   *   - to (string): địa chỉ nhận
   *   - amount (bigint): số lượng token (raw value)
   * Output: Hash (transaction hash)
   * Mã giả:
   *   1. Check wallet client exists
   *   2. Validate to address
   *   3. Gọi contract.write.transfer(to, amount)
   *   4. Wait for transaction confirmation
   *   5. Return tx hash
   */
  async transfer(to: string, amount: bigint): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet client required for write operations");
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      chain: creditCoin3Testnet,
      abi: PointsTokenABI,
      functionName: "transfer",
      args: [to as Address, amount],
      account: this.account,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * approve: Cho phép spender xài token
   * Input:
   *   - spender (string): địa chỉ được approve
   *   - amount (bigint): số lượng token được phép xài
   * Output: Hash (transaction hash)
   * Mã giả:
   *   1. Check wallet client exists
   *   2. Validate spender address
   *   3. Gọi contract.write.approve(spender, amount)
   *   4. Wait for confirmation
   *   5. Return tx hash
   */
  async approve(spender: string, amount: bigint): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet client required for write operations");
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      chain: creditCoin3Testnet,
      abi: PointsTokenABI,
      functionName: "approve",
      args: [spender as Address, amount],
      account: this.account,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * transferFrom: Chuyển token từ owner sang to (cần approve trước)
   * Input:
   *   - from (string): địa chỉ gửi
   *   - to (string): địa chỉ nhận
   *   - amount (bigint): số lượng token
   * Output: Hash (transaction hash)
   * Mã giả:
   *   1. Check wallet client exists
   *   2. Check allowance >= amount
   *   3. Gọi contract.write.transferFrom(from, to, amount)
   *   4. Wait for confirmation
   *   5. Return tx hash
   */
  async transferFrom(from: string, to: string, amount: bigint): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet client required for write operations");
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      chain: creditCoin3Testnet,
      abi: PointsTokenABI,
      functionName: "transferFrom",
      args: [from as Address, to as Address, amount],
      account: this.account,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * mint: Mint token mới (cần MINTER_ROLE)
   * Input:
   *   - to (string): địa chỉ nhận token
   *   - amount (bigint): số lượng token mint
   * Output: Hash (transaction hash)
   * Mã giả:
   *   1. Check wallet client exists
   *   2. Check caller có MINTER_ROLE
   *   3. Gọi contract.write.mint(to, amount)
   *   4. Wait for confirmation
   *   5. Emit Transfer event from 0x0 to `to`
   *   6. Return tx hash
   */
  async mint(to: string, amount: bigint): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet client required for write operations");
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      chain: creditCoin3Testnet,
      abi: PointsTokenABI,
      functionName: "mint",
      args: [to as Address, amount],
      account: this.account,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * batchMint: Mint token cho nhiều địa chỉ cùng lúc
   * Input:
   *   - recipients (string[]): mảng địa chỉ nhận
   *   - amounts (bigint[]): mảng số lượng token tương ứng
   * Output: Hash (transaction hash)
   * Mã giả:
   *   1. Check wallet client exists
   *   2. Check recipients.length === amounts.length
   *   3. Gọi contract.write.batchMint(recipients, amounts)
   *   4. Wait for confirmation
   *   5. Return tx hash
   */
  async batchMint(recipients: string[], amounts: bigint[]): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet client required for write operations");
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      chain: creditCoin3Testnet,
      abi: PointsTokenABI,
      functionName: "batchMint",
      args: [recipients as Address[], amounts],
      account: this.account,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * burn: Đốt token (giảm supply)
   * Input:
   *   - amount (bigint): số lượng token cần đốt
   * Output: Hash (transaction hash)
   * Mã giả:
   *   1. Check wallet client exists
   *   2. Check balance >= amount
   *   3. Gọi contract.write.burn(amount)
   *   4. Wait for confirmation
   *   5. Emit Transfer event from caller to 0x0
   *   6. Return tx hash
   */
  async burn(amount: bigint): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet client required for write operations");
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      chain: creditCoin3Testnet,
      abi: PointsTokenABI,
      functionName: "burn",
      args: [amount],
      account: this.account,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * burnFrom: Đốt token từ account khác (cần approve)
   * Input:
   *   - account (string): địa chỉ bị đốt token
   *   - amount (bigint): số lượng token
   * Output: Hash (transaction hash)
   * Mã giả:
   *   1. Check wallet client exists
   *   2. Check allowance >= amount
   *   3. Gọi contract.write.burnFrom(account, amount)
   *   4. Wait for confirmation
   *   5. Return tx hash
   */
  async burnFrom(account: string, amount: bigint): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet client required for write operations");
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      chain: creditCoin3Testnet,
      abi: PointsTokenABI,
      functionName: "burnFrom",
      args: [account as Address, amount],
      account: this.account,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * addMinter: Thêm minter mới (cần ADMIN_ROLE)
   * Input: account (string) - địa chỉ được cấp quyền minter
   * Output: Hash (transaction hash)
   * Mã giả:
   *   1. Check wallet client exists
   *   2. Check caller có ADMIN_ROLE
   *   3. Gọi contract.write.addMinter(account)
   *   4. Wait for confirmation
   *   5. Emit MinterAdded event
   *   6. Return tx hash
   */
  async addMinter(account: string): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet client required for write operations");
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      chain: creditCoin3Testnet,
      abi: PointsTokenABI,
      functionName: "addMinter",
      args: [account as Address],
      account: this.account,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * removeMinter: Xóa minter (cần ADMIN_ROLE)
   * Input: account (string) - địa chỉ bị thu hồi quyền minter
   * Output: Hash (transaction hash)
   * Mã giả:
   *   1. Check wallet client exists
   *   2. Check caller có ADMIN_ROLE
   *   3. Gọi contract.write.removeMinter(account)
   *   4. Wait for confirmation
   *   5. Emit MinterRemoved event
   *   6. Return tx hash
   */
  async removeMinter(account: string): Promise<Hash> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet client required for write operations");
    }

    const hash = await this.walletClient.writeContract({
      address: this.contractAddress,
      chain: creditCoin3Testnet,
      abi: PointsTokenABI,
      functionName: "removeMinter",
      args: [account as Address],
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
      abi: PointsTokenABI,
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
      abi: PointsTokenABI,
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
      abi: PointsTokenABI,
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
      abi: PointsTokenABI,
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
   * formatAmount: Chuyển raw amount sang human-readable
   * Input: amount (bigint) - raw token amount
   * Output: string - formatted amount (vd: "100.5")
   * Mã giả:
   *   1. Lấy decimals
   *   2. Chia amount cho 10^decimals
   *   3. Return string
   */
  async formatAmount(amount: bigint): Promise<string> {
    const decimals = await this.decimals();
    return formatUnits(amount, decimals);
  }

  /**
   * parseAmount: Chuyển human-readable sang raw amount
   * Input: amount (string) - formatted amount (vd: "100.5")
   * Output: bigint - raw token amount
   * Mã giả:
   *   1. Lấy decimals
   *   2. Nhân amount với 10^decimals
   *   3. Return bigint
   */
  async parseAmount(amount: string): Promise<bigint> {
    const decimals = await this.decimals();
    return parseUnits(amount, decimals);
  }

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
import { PointsTokenRepository } from '@/repositories/PointsTokenRepository';


// 1. READ-ONLY (không cần private key)
const repo = new PointsTokenRepository();

// Đọc thông tin token
const name = await repo.name(); // "PointsToken"
const symbol = await repo.symbol(); // "PTS"
const decimals = await repo.decimals(); // 18
const totalSupply = await repo.totalSupply(); // bigint

// Check balance
const balance = await repo.balanceOf('0xUserAddress');
const formatted = await repo.formatAmount(balance); // "100.5"

// Check roles
const isMinter = await repo.isMinter('0xUserAddress'); // true/false
const minterRole = await repo.MINTER_ROLE(); // 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6

// 2. WITH WALLET (cần private key cho write operations)
const repoWithWallet = new PointsTokenRepository();

// Mint tokens (cần MINTER_ROLE)
const amount = await repoWithWallet.parseAmount('100'); // 100 tokens
const mintHash = await repoWithWallet.mint('0xUserAddress', amount);
console.log('Minted! Tx hash:', mintHash);

// Batch mint
const recipients = ['0xUser1', '0xUser2', '0xUser3'];
const amounts = [
  await repoWithWallet.parseAmount('50'),
  await repoWithWallet.parseAmount('75'),
  await repoWithWallet.parseAmount('100')
];
const batchHash = await repoWithWallet.batchMint(recipients, amounts);

// Transfer tokens
const transferAmount = await repoWithWallet.parseAmount('10');
const transferHash = await repoWithWallet.transfer('0xRecipient', transferAmount);

// Add minter (cần ADMIN_ROLE)
const addMinterHash = await repoWithWallet.addMinter('0xNewMinter');

// Pause contract (cần PAUSER_ROLE)
const pauseHash = await repoWithWallet.pause();

// Get transaction receipt
const receipt = await repoWithWallet.getTransactionReceipt(mintHash);
console.log('Status:', receipt.status); // 'success' hoặc 'reverted'
console.log('Block:', receipt.blockNumber);
console.log('Gas used:', receipt.gasUsed);
*/