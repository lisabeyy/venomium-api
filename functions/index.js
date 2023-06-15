const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors');
const express = require('express');

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

console.log('hello');
// Create a new watchlist entry
app.post('/watchlist', async (req, res) => {
  try {
    const { accountAddress, walletAddress, label } = req.body;

    const watchlistRef = admin.firestore().collection('watchlists').doc(accountAddress);
    await watchlistRef.set({
      [walletAddress]: { label, walletAddress},
    }, { merge: true });

    res.status(201).json({ message: 'Watchlist entry created successfully' });
  } catch (error) {
    console.error('Error creating watchlist entry:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get the watchlist entries for an account
app.get('/watchlist/:accountAddress', async (req, res) => {
  try {
    const { accountAddress } = req.params;

    const watchlistSnapshot = await admin.firestore().collection('watchlists').doc(accountAddress).get();
    const watchlist = watchlistSnapshot.exists ? watchlistSnapshot.data() : {};

    res.status(200).json(watchlist);
  } catch (error) {
    console.error('Error retrieving watchlist entries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a watchlist entry
app.put('/watchlist/:accountAddress/:walletAddress', async (req, res) => {
  try {
    const { accountAddress, walletAddress } = req.params;
    const { label } = req.body;

    const watchlistRef = admin.firestore().collection('watchlists').doc(accountAddress);
    await watchlistRef.set({
      [walletAddress]: { label },
    }, { merge: true });

    res.status(200).json({ message: 'Watchlist entry updated successfully' });
  } catch (error) {
    console.error('Error updating watchlist entry:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a watchlist entry
app.delete('/watchlist/:accountAddress/:walletAddress', async (req, res) => {
  try {
    const { accountAddress, walletAddress } = req.params;

    const watchlistRef = admin.firestore().collection('watchlists').doc(accountAddress);
    await watchlistRef.update({
      [walletAddress]: admin.firestore.FieldValue.delete(),
    });

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting watchlist entry:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Expose the Express app as a Firebase Cloud Function
exports.api = functions.https.onRequest(app);
