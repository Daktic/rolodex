import * as SecureStore from 'expo-secure-store';
import { privateKeyToAccount } from 'viem/accounts';
import { generatePrivateKey } from 'viem/accounts';

const WALLET_PRIVATE_KEY = 'WALLET_PRIVATE_KEY';

/**
 * Generates a new wallet and stores the private key securely
 */
const generateWallet = async () => {
    const privateKey = generatePrivateKey();
    await SecureStore.setItemAsync(WALLET_PRIVATE_KEY, privateKey);
    return privateKeyToAccount(privateKey);
};

/**
 * Retrieves the existing wallet or creates a new one if none exists
 */
const getOrCreateWallet = async () => {
    const existingKey = await SecureStore.getItemAsync(WALLET_PRIVATE_KEY);

    if (existingKey) {
        return privateKeyToAccount(existingKey as `0x${string}`);
    }

    return generateWallet();
};

/**
 * Returns the profile ID (public address) for the current wallet
 */
const getProfileId = async () => {
    const wallet = await getOrCreateWallet();
    console.log("getProfileId: wallet object:", wallet);
    console.log("getProfileId: wallet.address:", wallet.address);
    console.log("getProfileId: typeof wallet.address:", typeof wallet.address);
    return wallet.address;
};

/**
 * Signs a message with the wallet's private key
 * @param message - The message string to sign
 * @returns The signature as a hex string
 */
const signMessage = async (message: string) => {
    const wallet = await getOrCreateWallet();
    const signature = await wallet.signMessage({ message });
    return signature;
};

export { getProfileId, signMessage, getOrCreateWallet };