-- Allow customers to delete their own quote requests (needed for verify screen cleanup)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='quote_requests' AND policyname='Customers delete own quotes') THEN
    CREATE POLICY "Customers delete own quotes"
      ON public.quote_requests FOR DELETE
      USING (auth.uid() = customer_id);
  END IF;
END $$;
