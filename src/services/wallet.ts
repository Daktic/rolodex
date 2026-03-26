import * as SecureStore from 'expo-secure-store';
import { privateKeyToAccount } from 'viem/accounts';
import { generatePrivateKey } from 'viem/accounts';
import {upsertProfile} from "@/services/storage";

// In-memory cache to ensure wallet consistency during app session
let cachedWallet: ReturnType<typeof privateKeyToAccount> | null = null;
// Promise lock to prevent race conditions during initialization
let initializationPromise: Promise<ReturnType<typeof privateKeyToAccount>> | null = null;

/**
 * Generates a new wallet and stores the private key securely
 */
const generateWallet = async () => {
    const privateKey = generatePrivateKey();
    await SecureStore.setItemAsync('WALLET_PRIVATE_KEY', privateKey);
    cachedWallet = privateKeyToAccount(privateKey);
    // If we generate a new wallet, we need to create a new profile
    await upsertProfile(cachedWallet.address, "User");
    console.log("generateWallet: Created new wallet with address:", cachedWallet.address);
    return cachedWallet;
};

/**
 * Retrieves the existing wallet or creates a new one if none exists
 */
const getOrCreateWallet = async () => {
    // Return cached wallet if available
    if (cachedWallet) {
        console.log("getOrCreateWallet: Using cached wallet");
        return cachedWallet;
    }

    // If initialization is in progress, wait for it
    if (initializationPromise) {
        console.log("getOrCreateWallet: Waiting for initialization to complete");
        return initializationPromise;
    }

    // Start initialization
    initializationPromise = (async () => {
        const existingKey = await SecureStore.getItemAsync('WALLET_PRIVATE_KEY');

        if (existingKey) {
            const account = privateKeyToAccount(existingKey as `0x${string}`);
            console.log("getOrCreateWallet: Loaded existing wallet with address:", account.address);
            cachedWallet = account;
            await upsertProfile(account.address, "User");
            return account;
        }

        return generateWallet();
    })();

    try {
        const wallet = await initializationPromise;
        return wallet;
    } finally {
        // Clear the initialization promise after completion
        initializationPromise = null;
    }
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