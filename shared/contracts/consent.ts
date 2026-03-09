export interface CreateConsentRequest {
  beneficiaryId: string;
  proxyCreatorId: string;
  consentType: 'WRITTEN' | 'DIGITAL_SIGNATURE' | 'RECORDED_CALL';
  proofDocumentId: string;
  validUntil: string;
}

export interface ConsentRecord extends CreateConsentRequest {
  id: string;
  capturedAt: string;
  revokedAt?: string;
}
