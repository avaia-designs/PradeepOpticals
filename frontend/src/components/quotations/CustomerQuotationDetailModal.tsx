'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Quotation, QuotationStatus, StaffReply } from '@/types/quotation';
import { format, formatDistanceToNow } from 'date-fns';
import { useQuotation } from '@/hooks/useQuotations';
import { toast } from 'sonner';

interface CustomerQuotationDetailModalProps {
  quotationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (quotation: Quotation) => void;
  onReject?: (quotation: Quotation, reason: string) => void;
}

export const CustomerQuotationDetailModal: React.FC<CustomerQuotationDetailModalProps> = ({
  quotationId,
  isOpen,
  onClose,
  onApprove,
  onReject
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [staffNames, setStaffNames] = useState<Record<string, string>>({});

  // Fetch quotation details
  const { quotation, loading, error, refetch } = useQuotation(quotationId || '');

  // Auto-refresh every 30 seconds to get new staff replies
  useEffect(() => {
    if (!isOpen || !quotationId) return;

    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isOpen, quotationId, refetch]);

  // Fetch staff names for better UX
  useEffect(() => {
    if (quotation?.staffReplies) {
      const uniqueStaffIds = [...new Set(quotation.staffReplies.map(reply => reply.staffId))];
      fetchStaffNames(uniqueStaffIds);
    }
  }, [quotation?.staffReplies]);

  const fetchStaffNames = async (staffIds: string[]) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/staff-names`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ staffIds })
      });

      if (response.ok) {
        const data = await response.json();
        setStaffNames(data.data || {});
      }
    } catch (error) {
      console.error('Failed to fetch staff names:', error);
    }
  };

  if (!quotation && !loading) return null;

  const getStatusColor = (status: QuotationStatus) => {
    switch (status) {
      case QuotationStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case QuotationStatus.APPROVED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case QuotationStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      case QuotationStatus.CONVERTED:
        return 'bg-green-100 text-green-800 border-green-200';
      case QuotationStatus.EXPIRED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const formatRelativeTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const handleApprove = () => {
    if (onApprove && quotation) {
      onApprove(quotation);
    }
  };

  const handleReject = () => {
    if (onReject && quotation && rejectionReason.trim()) {
      onReject(quotation, rejectionReason);
      setRejectionReason('');
      setShowRejectForm(false);
    }
  };

  const handleDownloadPrescription = () => {
    if (quotation?.prescriptionFile) {
      window.open(quotation.prescriptionFile, '_blank');
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Quotation updated');
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span>Loading quotation details...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Quotation</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={refetch} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!quotation) return null;

  const StatusIcon = getStatusIcon(quotation.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Quotation {quotation.quotationNumber}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Badge className={`${getStatusColor(quotation.status)} border`}>
                <span className="flex items-center gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {quotation.status.toUpperCase()}
                </span>
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Information
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
                <CardTitle className="text-lg">Requested Items</CardTitle>
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

            {/* Customer Notes */}
            {quotation.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{quotation.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Staff Messages and Replies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Staff Messages & Replies
                  {quotation.staffReplies && quotation.staffReplies.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {quotation.staffReplies.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {quotation.staffReplies && quotation.staffReplies.length > 0 ? (
                  <div className="space-y-4">
                    {quotation.staffReplies
                      .sort((a, b) => new Date(a.repliedAt).getTime() - new Date(b.repliedAt).getTime())
                      .map((reply, index) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-4 py-3 bg-blue-50 rounded-r-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900">
                                  {staffNames[reply.staffId] || 'Staff Member'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatRelativeTime(reply.repliedAt)}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(reply.repliedAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.message}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No staff messages yet</p>
                    <p className="text-sm">Staff will reply to your quotation request soon.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Staff Notes (if visible to customer) */}
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

            {/* Customer Actions */}
            {quotation.status === QuotationStatus.APPROVED && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!showRejectForm ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={handleApprove}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve Quotation
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowRejectForm(true)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject Quotation
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Reason for rejection *</label>
                        <textarea
                          placeholder="Please provide a reason for rejecting this quotation..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          onClick={handleReject}
                          disabled={!rejectionReason.trim()}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Confirm Rejection
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowRejectForm(false);
                            setRejectionReason('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Status Information */}
            {quotation.status === QuotationStatus.REJECTED && quotation.rejectedReason && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Quotation Rejected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-700">{quotation.rejectedReason}</p>
                </CardContent>
              </Card>
            )}

            {quotation.status === QuotationStatus.CONVERTED && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Quotation Converted to Order
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-700">
                    This quotation has been converted to an order and is being processed.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
