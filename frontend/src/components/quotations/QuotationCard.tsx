'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Eye, 
  MessageSquare,
  Calendar,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { Quotation, QuotationStatus } from '@/types/quotation';

interface QuotationCardProps {
  quotation: Quotation;
  onViewDetails: (quotation: Quotation) => void;
  onApprove?: (quotation: Quotation) => void;
  onReject?: (quotation: Quotation) => void;
  onReply?: (quotation: Quotation) => void;
  onConvert?: (quotation: Quotation) => void;
  showActions?: boolean;
  isStaff?: boolean;
}

export const QuotationCard: React.FC<QuotationCardProps> = ({
  quotation,
  onViewDetails,
  onApprove,
  onReject,
  onReply,
  onConvert,
  showActions = true,
  isStaff = false
}) => {
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatusIcon = getStatusIcon(quotation.status);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{quotation.quotationNumber}</CardTitle>
            <p className="text-sm text-gray-500">
              Created on {formatDate(quotation.createdAt)}
            </p>
          </div>
          <Badge className={getStatusColor(quotation.status)}>
            <span className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {quotation.status}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Customer Info */}
          {isStaff && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{quotation.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{quotation.customerEmail}</span>
              </div>
              {quotation.customerPhone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{quotation.customerPhone}</span>
                </div>
              )}
            </div>
          )}

          {/* Items */}
          <div>
            <h4 className="font-medium text-sm mb-2">Items</h4>
            <div className="space-y-1">
              {quotation.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.productName} x{item.quantity}</span>
                  <span className="font-medium">${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t pt-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${quotation.subtotal.toFixed(2)}</span>
            </div>
            {quotation.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>${quotation.tax.toFixed(2)}</span>
              </div>
            )}
            {quotation.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount:</span>
                <span>-${quotation.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-base border-t pt-1 mt-1">
              <span>Total:</span>
              <span>${quotation.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          {quotation.notes && (
            <div>
              <h4 className="font-medium text-sm mb-1">Notes</h4>
              <p className="text-sm text-gray-600 line-clamp-2">{quotation.notes}</p>
            </div>
          )}

          {/* Staff Replies */}
          {quotation.staffReplies && quotation.staffReplies.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Staff Replies ({quotation.staffReplies.length})</h4>
              <div className="space-y-2">
                {quotation.staffReplies.slice(-2).map((reply, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                    <p className="line-clamp-2">{reply.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(reply.repliedAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validity */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Valid until {formatDate(quotation.validUntil)}</span>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(quotation)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              
              {isStaff && (
                <>
                  {quotation.status === QuotationStatus.PENDING && (
                    <>
                      {onApprove && (
                        <Button
                          size="sm"
                          onClick={() => onApprove(quotation)}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      {onReject && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onReject(quotation)}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      )}
                    </>
                  )}
                  {quotation.status === QuotationStatus.APPROVED && onConvert && (
                    <Button
                      size="sm"
                      onClick={() => onConvert(quotation)}
                      className="flex-1"
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Convert
                    </Button>
                  )}
                  {onReply && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReply(quotation)}
                      className="flex-1"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
