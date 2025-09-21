'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Download,
  MessageSquare,
  Eye,
} from 'lucide-react';
import { Quotation, QuotationStatus } from '@/types/quotation';
import { format } from 'date-fns';

interface QuotationDetailModalProps {
  quotation: Quotation | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (quotation: Quotation, staffNotes?: string) => void;
  onReject?: (quotation: Quotation, reason: string, staffNotes?: string) => void;
  onReply?: (quotation: Quotation, message: string) => void;
  onConvert?: (quotation: Quotation) => void;
  isStaff?: boolean;
  loading?: boolean;
}

export const QuotationDetailModal: React.FC<QuotationDetailModalProps> = ({
  quotation,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onReply,
  onConvert,
  isStaff = false,
  loading = false
}) => {
  const [staffNotes, setStaffNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'replies'>('details');

  if (!quotation) return null;

  const getStatusColor = (status: QuotationStatus) => {
    switch (status) {
      case QuotationStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case QuotationStatus.APPROVED:
        return 'bg-blue-100 text-blue-800';
      case QuotationStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case QuotationStatus.CONVERTED:
        return 'bg-green-100 text-green-800';
      case QuotationStatus.EXPIRED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: QuotationStatus) => {
    switch (status) {
      case QuotationStatus.PENDING:
        return Clock;
      case QuotationStatus.APPROVED:
        return CheckCircle;
      case QuotationStatus.REJECTED:
        return XCircle;
      case QuotationStatus.CONVERTED:
        return DollarSign;
      case QuotationStatus.EXPIRED:
        return Clock;
      default:
        return Clock;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const StatusIcon = getStatusIcon(quotation.status);

  const handleApprove = () => {
    if (onApprove) {
      onApprove(quotation, staffNotes);
      setStaffNotes('');
    }
  };

  const handleReject = () => {
    if (onReject && rejectionReason.trim()) {
      onReject(quotation, rejectionReason, staffNotes);
      setRejectionReason('');
      setStaffNotes('');
    }
  };

  const handleReply = () => {
    if (onReply && replyMessage.trim()) {
      onReply(quotation, replyMessage);
      setReplyMessage('');
    }
  };

  const handleConvert = () => {
    if (onConvert) {
      onConvert(quotation);
    }
  };

  const handleDownloadPrescription = () => {
    if (quotation.prescriptionFile) {
      window.open(quotation.prescriptionFile, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Quotation {quotation.quotationNumber}
            </DialogTitle>
            <Badge className={getStatusColor(quotation.status)}>
              <span className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {quotation.status}
              </span>
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{quotation.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{quotation.customerEmail}</span>
                  </div>
                  {quotation.customerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{quotation.customerPhone}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Created: {formatDate(quotation.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Valid until: {formatDate(quotation.validUntil)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotation.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productName}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Unit Price: ${(item.unitPrice || 0).toFixed(2)}</p>
                        {item.specifications && Object.keys(item.specifications).length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">Specifications:</p>
                            <div className="text-sm text-gray-600">
                              {Object.entries(item.specifications).map(([key, value]) => (
                                <div key={key}>
                                  <span className="capitalize">{key}:</span> {value}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.totalPrice || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${(quotation.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${(quotation.tax || 0).toFixed(2)}</span>
                </div>
                {(quotation.discount || 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-${(quotation.discount || 0).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total:</span>
                  <span>${(quotation.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prescription File */}
          {quotation.prescriptionFile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Prescription File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Prescription uploaded</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPrescription}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {quotation.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{quotation.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Staff Notes */}
          {quotation.staffNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Staff Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{quotation.staffNotes}</p>
              </CardContent>
            </Card>
          )}

          {/* Staff Replies */}
          {quotation.staffReplies && quotation.staffReplies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Staff Replies ({quotation.staffReplies.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quotation.staffReplies.map((reply, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                      <p className="text-sm text-gray-700">{reply.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(reply.repliedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Staff Actions */}
          {isStaff && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Staff Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Staff Notes */}
                <div>
                  <label className="text-sm font-medium">Staff Notes</label>
                  <Textarea
                    placeholder="Add internal notes about this quotation..."
                    value={staffNotes}
                    onChange={(e) => setStaffNotes(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {quotation.status === QuotationStatus.PENDING && (
                    <>
                      <Button
                        onClick={handleApprove}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={loading || !rejectionReason.trim()}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {quotation.status === QuotationStatus.APPROVED && (
                    <Button
                      onClick={handleConvert}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Convert to Order
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleReply}
                    disabled={loading || !replyMessage.trim()}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Reply to Customer
                  </Button>
                </div>

                {/* Rejection Reason */}
                {quotation.status === QuotationStatus.PENDING && (
                  <div>
                    <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
                    <Textarea
                      placeholder="Please provide a reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                )}

                {/* Reply Message */}
                <div>
                  <label className="text-sm font-medium">Reply to Customer</label>
                  <Textarea
                    placeholder="Type your message to the customer..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
