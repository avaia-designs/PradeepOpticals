'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Search,
  Filter,
} from 'lucide-react';
import { useUserStore } from '@/stores/user-store';
import { RoleGuard } from '@/components/auth/role-guard';
import { Permission } from '@/lib/permissions';
import { useQuotations, useCreateQuotation, useCustomerApproveQuotation, useCustomerRejectQuotation } from '@/hooks/useQuotations';
import { QuotationCard } from '@/components/quotations/QuotationCard';
import { QuotationForm } from '@/components/quotations/QuotationForm';
import { CustomerQuotationDetailModal } from '@/components/quotations/CustomerQuotationDetailModal';
import { Quotation, QuotationStatus, CreateQuotationRequest } from '@/types/quotation';
import { toast } from 'sonner';

export default function QuotationsPage() {
  const { user, isAuthenticated } = useUserStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // API hooks
  const { quotations, loading, error, refetch } = useQuotations({
    page: 1,
    limit: 20,
    status: selectedStatus === 'all' ? undefined : selectedStatus as QuotationStatus,
    search: searchTerm || undefined
  });

  const { createQuotation, loading: createLoading } = useCreateQuotation();
  const { customerApproveQuotation, loading: approveLoading } = useCustomerApproveQuotation();
  const { customerRejectQuotation, loading: rejectLoading } = useCustomerRejectQuotation();


  const handleCreateQuotation = async (data: CreateQuotationRequest) => {
    try {
      const result = await createQuotation(data);
      if (result) {
        toast.success('Quotation created successfully!');
        setIsCreateDialogOpen(false);
        refetch();
      }
    } catch (error) {
      toast.error('Failed to create quotation');
    }
  };

  const handleApproveQuotation = async (quotation: Quotation) => {
    try {
      const success = await customerApproveQuotation(quotation._id);
      if (success) {
        toast.success('Quotation approved successfully!');
        setIsApproveDialogOpen(false);
        refetch();
      }
    } catch (error) {
      toast.error('Failed to approve quotation');
    }
  };

  const handleRejectQuotation = async (quotation: Quotation, reason: string) => {
    try {
      const success = await customerRejectQuotation(quotation._id, {
        reason: reason
      });
      if (success) {
        toast.success('Quotation rejected successfully');
        setIsRejectDialogOpen(false);
        setRejectionReason('');
        refetch();
      }
    } catch (error) {
      toast.error('Failed to reject quotation');
    }
  };

  const handleViewDetails = (quotation: Quotation) => {
    setSelectedQuotationId(quotation._id);
    setIsDetailModalOpen(true);
  };

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to view and manage your quotations.</p>
            <div className="space-x-4">
              <Button asChild>
                <a href="/auth/login">Log In</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/auth/register">Sign Up</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Error loading quotations: {error}</p>
            <Button onClick={refetch} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
              <p className="text-gray-600">Request custom quotations for your eyewear needs.</p>
            </div>
            <RoleGuard permission={Permission.REQUEST_QUOTATION}>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Request Quotation
                  </Button>
          </RoleGuard>
                    </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                    placeholder="Search quotations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                      </div>
                    </div>
              <div className="flex gap-4">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                  </SelectContent>
                </Select>
                      </div>
                    </div>
          </CardContent>
        </Card>

          {/* Quotations List */}
        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredQuotations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedStatus !== 'all' 
                  ? 'No quotations match your current filters.' 
                  : 'You haven\'t requested any quotations yet.'}
              </p>
              {!searchTerm && selectedStatus === 'all' && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Request Your First Quotation
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredQuotations.map((quotation) => (
              <QuotationCard
                key={quotation._id}
                quotation={quotation}
                onViewDetails={handleViewDetails}
                onApprove={quotation.status === QuotationStatus.APPROVED ? handleApproveQuotation : undefined}
                onReject={quotation.status === QuotationStatus.APPROVED ? (quotation) => {
                  setSelectedQuotationId(quotation._id);
                  setIsRejectDialogOpen(true);
                } : undefined}
                showActions={true}
                isStaff={false}
              />
            ))}
          </div>
        )}

        {/* Create Quotation Dialog */}
        <QuotationForm
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreateQuotation}
          loading={createLoading}
        />

        {/* Customer Quotation Detail Modal */}
        <CustomerQuotationDetailModal
          quotationId={selectedQuotationId}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedQuotationId(null);
          }}
          onApprove={handleApproveQuotation}
          onReject={handleRejectQuotation}
        />

        {/* Approve Quotation Dialog */}
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Quotation</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve this quotation? 
                This will make it ready for order conversion.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  const quotation = quotations.find(q => q._id === selectedQuotationId);
                  if (quotation) {
                    handleApproveQuotation(quotation);
                  }
                }}
                disabled={approveLoading}
              >
                {approveLoading ? 'Approving...' : 'Approve Quotation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Quotation Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Quotation</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this quotation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Reason for rejection *</label>
                <Input
                  placeholder="Please provide a reason..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-1"
                />
          </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  const quotation = quotations.find(q => q._id === selectedQuotationId);
                  if (quotation) {
                    handleRejectQuotation(quotation, rejectionReason);
                  }
                }}
                disabled={!rejectionReason.trim() || rejectLoading}
              >
                {rejectLoading ? 'Rejecting...' : 'Reject Quotation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
  );
}