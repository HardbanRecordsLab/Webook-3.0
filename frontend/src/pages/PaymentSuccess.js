import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getPaymentStatus, capturePaypalPayment } from '../lib/api';
import { Check, Loader2, X, Download, ExternalLink, Sparkles, Globe, Github } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [projectId, setProjectId] = useState(null);
  const hasPolled = useRef(false);

  useEffect(() => {
    if (hasPolled.current) return;
    hasPolled.current = true;

    const sessionId = searchParams.get('session_id');
    const method = searchParams.get('method');
    const paypalToken = searchParams.get('token');
    
    // Handle PayPal return
    if (method === 'paypal' && paypalToken) {
      handlePaypalCapture(paypalToken);
      return;
    }
    
    // Handle P24 return (session_id already included)
    if (method === 'p24' && sessionId) {
      pollPaymentStatus(sessionId);
      return;
    }
    
    // Handle Stripe return
    if (!sessionId) { setStatus('failed'); return; }
    pollPaymentStatus(sessionId);
  }, [searchParams]);

  const handlePaypalCapture = async (token) => {
    try {
      const res = await capturePaypalPayment(token);
      if (res.data.status === 'COMPLETED') {
        setStatus('success');
        // Get project ID from transaction
        const statusRes = await getPaymentStatus(token);
        setProjectId(statusRes.data.project_id);
      } else {
        setStatus('failed');
      }
    } catch (error) {
      setStatus('failed');
    }
  };

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    if (attempts >= 5) { setStatus('failed'); return; }
    try {
      const res = await getPaymentStatus(sessionId);
      if (res.data.payment_status === 'paid') {
        setStatus('success');
        setProjectId(res.data.project_id);
        return;
      }
      if (res.data.status === 'expired') { setStatus('failed'); return; }
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), 2000);
    } catch (error) {
      setStatus('failed');
    }
  };

  const deployOptions = [
    { name: 'Download HTML', desc: 'Self-host anywhere', icon: <Download className="w-5 h-5" />, action: () => navigate(`/builder/${projectId}`) },
    { name: 'Deploy to Vercel', desc: 'Instant global CDN', icon: <Globe className="w-5 h-5" />, action: () => window.open('https://vercel.com', '_blank') },
    { name: 'Deploy to Netlify', desc: 'Automatic SSL', icon: <Sparkles className="w-5 h-5" />, action: () => window.open('https://netlify.com', '_blank') },
    { name: 'GitHub Pages', desc: 'Version controlled', icon: <Github className="w-5 h-5" />, action: () => window.open('https://pages.github.com', '_blank') },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 animated-gradient opacity-30 pointer-events-none" />
      
      <Card className="relative max-w-md w-full premium-card rounded-3xl overflow-hidden">
        {status === 'success' && <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />}
        
        <CardHeader className="text-center pt-10 pb-4">
          {status === 'checking' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
              <CardTitle className="text-2xl font-heading">Verifying payment...</CardTitle>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                <Check className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-heading gradient-text">Payment Successful!</CardTitle>
            </>
          )}
          
          {status === 'failed' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                <X className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-heading text-destructive">Payment Failed</CardTitle>
            </>
          )}
        </CardHeader>
        
        <CardContent className="text-center pb-10 space-y-6">
          {status === 'success' && (
            <>
              <p className="text-muted-foreground">Your webbook is ready to publish! Choose a deployment option:</p>
              
              <div className="space-y-3">
                {deployOptions.map((opt, i) => (
                  <Button key={i} variant="outline" className="w-full justify-start rounded-xl h-14 hover:bg-accent" onClick={opt.action}>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3 text-primary">{opt.icon}</div>
                    <div className="text-left">
                      <p className="font-medium">{opt.name}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </Button>
                ))}
              </div>
              
              <Button onClick={() => navigate(`/builder/${projectId}`)} className="w-full btn-shine rounded-full mt-4" size="lg">
                Go to Project
              </Button>
            </>
          )}
          
          {status === 'failed' && (
            <>
              <p className="text-muted-foreground">Something went wrong with your payment. Please try again or contact support.</p>
              <Button onClick={() => navigate('/dashboard')} className="w-full rounded-full" size="lg">Back to Dashboard</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
