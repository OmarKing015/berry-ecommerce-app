export interface PaymobCustomer {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    country: string
    postalCode: string
  }
  
  export interface PaymobItem {
    id: string
    name: string
    price: number
    quantity: number
    image: string
  }
  
  export interface PaymobOrderRequest {
    amount: number
    currency: string
    items: PaymobItem[]
    customer: PaymobCustomer
  }
  
  export interface PaymobAuthResponse {
    token: string
  }
  
  export interface PaymobOrderResponse {
    id: number
    created_at: string
    delivery_needed: boolean
    merchant: {
      id: number
      created_at: string
      phones: string[]
      company_emails: string[]
      company_name: string
      state: string
      country: string
      city: string
      postal_code: string
      street: string
    }
    collector: any
    amount_cents: number
    shipping_data: any
    currency: string
    is_payment_locked: boolean
    is_return: boolean
    is_cancel: boolean
    is_returned: boolean
    is_canceled: boolean
    merchant_order_id: any
    wallet_notification: any
    paid_amount_cents: number
    notify_user_with_email: boolean
    items: any[]
    order_url: string
    commission_fees: number
    delivery_fees_cents: number
    delivery_vat_cents: number
    payment_method: string
    merchant_staff_tag: any
    api_source: string
    data: any
  }
  
  export interface PaymobPaymentKeyResponse {
    token: string
  }
  
  export interface PaymobWebhookData {
    type: string
    obj: {
      id: number
      pending: boolean
      amount_cents: number
      success: boolean
      is_auth: boolean
      is_capture: boolean
      is_standalone_payment: boolean
      is_voided: boolean
      is_refunded: boolean
      is_3d_secure: boolean
      integration_id: number
      profile_id: number
      has_parent_transaction: boolean
      order: {
        id: number
        created_at: string
        delivery_needed: boolean
        merchant: any
        collector: any
        amount_cents: number
        shipping_data: any
        currency: string
        is_payment_locked: boolean
        merchant_order_id: string
        wallet_notification: any
        paid_amount_cents: number
        items: any[]
        order_url: string
        commission_fees: number
        delivery_fees_cents: number
        delivery_vat_cents: number
        payment_method: string
        api_source: string
        data: any
      }
      created_at: string
      transaction_processed_callback_responses: any[]
      currency: string
      source_data: {
        pan: string
        type: string
        tenure: any
        sub_type: string
      }
      api_source: string
      terminal_id: any
      merchant_commission: number
      installment: any
      discount_details: any[]
      is_void: boolean
      is_refund: boolean
      data: any
      is_hidden: boolean
      payment_key_claims: {
        user_id: number
        currency: string
        amount_cents: number
        integration_id: number
        lock_order_when_paid: boolean
        single_payment_attempt: boolean
        exp: number
        pmk_ip: string
        billing_data: any
        shipping_data: any
        extra: any
      }
      error_occured: boolean
      is_live: boolean
      other_endpoint_reference: any
      refunded_amount_cents: number
      source_id: number
      is_captured: boolean
      captured_amount: number
      merchant_staff_tag: any
      updated_at: string
      is_settled: boolean
      bill_balanced: boolean
      is_bill: boolean
      owner: number
      parent_transaction: any
    }
  }
  