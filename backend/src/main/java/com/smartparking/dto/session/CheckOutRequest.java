package com.smartparking.dto.session;

import com.smartparking.model.PaymentMethod;

/**
 * Request payload for vehicle check-out and fare payment.
 */
public class CheckOutRequest {

    private String exitGate = "Exit-1";

    private PaymentMethod paymentMethod = PaymentMethod.UPI;

    public CheckOutRequest() {}

    public CheckOutRequest(String exitGate, PaymentMethod paymentMethod) {
        this.exitGate = exitGate;
        this.paymentMethod = paymentMethod;
    }

    public String getExitGate() { return exitGate; }
    public void setExitGate(String exitGate) { this.exitGate = exitGate; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
}
