import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kiybhvpmujasghkyykna.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpeWJodnBtdWphc2doa3l5a25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTMzNDgsImV4cCI6MjA5MzU2OTM0OH0.FBGE6RZmv8jx3dvD6rHOTMi9z8SsfvBtXr7Lk6SdWg4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearMockOrders() {
  const { data, error } = await supabase
    .from('orders')
    .delete()
    .like('order_no', 'ORD-DEMO-%');

  if (error) {
    console.error('Error deleting mock orders:', error);
  } else {
    console.log('Successfully deleted mock orders!');
  }
}

clearMockOrders();
