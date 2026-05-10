const express = require('express');
const Stripe = require('stripe');
const path = require('path');

// ⚠️ YOUR SECRET KEY – never expose in frontend
const stripe = Stripe('sk_test_51TUHOEHX2lYpXtqdmQpAMWSjb61z9EcGNshzz9YfFKYdtmqxTEFXsIo4BJUSmAMeXj1mfzTyZqQROepPRgu0WqbN008vLgmta3');

const app = express();
app.use(express.json());
app.use(express.static(__dirname)); // serve index.html, success.html, etc.

app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'HY Analysts Terminal Access',
                        description: 'Unlock supply chain layers and map features',
                    },
                    unit_amount: 999, // $9.99 in cents – change as you wish
                },
                quantity: 1,
            }],
            mode: 'payment', // one-time payment
            success_url: 'http://localhost:4242/success.html',
            cancel_url: 'http://localhost:4242/',
        });
        res.json({ id: session.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(4242, () => console.log('🚀 Server running on http://localhost:4242'));
