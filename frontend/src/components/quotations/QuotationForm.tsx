'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Trash2,
  Upload,
  FileText,
  DollarSign,
  X,
  CheckCircle,
} from 'lucide-react';
import { CreateQuotationRequest, QuotationItem } from '@/types/quotation';
import { Product } from '@/types';
import { useUserStore } from '@/stores/user-store';
import { useProducts } from '@/hooks/use-products';
import { FileUploadService } from '@/lib/services/file-upload.service';
import { ProductSelector } from './ProductSelector';
import { toast } from 'sonner';

interface QuotationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateQuotationRequest) => void;
  loading?: boolean;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const { user } = useUserStore();
  const { data: productsData, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts(1, 100); // Get all products for selection
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: ''
  });
  const [quotationItems, setQuotationItems] = useState<Array<QuotationItem & { id: number }>>([
    { id: 1, productId: '', productName: '', productImage: '', quantity: 1, unitPrice: 0, totalPrice: 0, specifications: {} }
  ]);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionFileUrl, setPrescriptionFileUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const products = productsData?.data || [];

  const calculateSubtotal = () => {
    return quotationItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const addQuotationItem = () => {
    const newId = Math.max(...quotationItems.map(item => item.id), 0) + 1;
    setQuotationItems([...quotationItems, {
      id: newId,
      productId: '',
      productName: '',
      productImage: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      specifications: {}
    }]);
  };

  const removeQuotationItem = (id: number) => {
    if (quotationItems.length > 1) {
      setQuotationItems(quotationItems.filter(item => item.id !== id));
    }
  };

  const updateQuotationItem = (id: number, field: keyof QuotationItem, value: any) => {
    setQuotationItems(quotationItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total price when quantity or unit price changes
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleProductSelect = (id: number, productId: string) => {
    const product = products.find(p => p._id === productId);
    
    if (product) {
      setQuotationItems(prevItems => {
        return prevItems.map(item => {
          if (item.id === id) {
            return {
              ...item,
              productId: productId,
              productName: product.name,
              productImage: product.images[0] || '',
              unitPrice: product.price,
              totalPrice: product.price * item.quantity
            };
          }
          return item;
        });
      });
    }
  };

  // Populate user data when form opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        customerName: user.name || '',
        customerEmail: user.email || '',
        customerPhone: user.profile?.phone || '',
        notes: ''
      });
    }
  }, [isOpen, user]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image or PDF file');
      return;
    }

    setPrescriptionFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await FileUploadService.uploadFile(file, {
        onProgress: (progress) => setUploadProgress(progress)
      });
      
      setPrescriptionFileUrl(result.url);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to upload file');
      setPrescriptionFile(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setPrescriptionFile(null);
    setPrescriptionFileUrl(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Customer email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    if (quotationItems.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    quotationItems.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`item_${index}_product`] = 'Please select a product';
      }
      if (item.quantity < 1) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be at least 1';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const quotationData: CreateQuotationRequest = {
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone || undefined,
      items: quotationItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        specifications: item.specifications
      })),
      notes: formData.notes || undefined,
      prescriptionFile: prescriptionFileUrl || undefined
    };

    onSubmit(quotationData);
  };

  const resetForm = () => {
    setFormData({
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      customerPhone: user?.profile?.phone || '',
      notes: ''
    });
    setQuotationItems([
      { id: 1, productId: '', productName: '', productImage: '', quantity: 1, unitPrice: 0, totalPrice: 0, specifications: {} }
    ]);
    setPrescriptionFile(null);
    setPrescriptionFileUrl(null);
    setErrors({});
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Quotation</DialogTitle>
          <DialogDescription className="text-base">
            Request a custom quotation for your eyewear needs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className={errors.customerName ? 'border-red-500' : ''}
                  />
                  {errors.customerName && (
                    <p className="text-sm text-red-600 mt-1">{errors.customerName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email Address *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className={errors.customerEmail ? 'border-red-500' : ''}
                  />
                  {errors.customerEmail && (
                    <p className="text-sm text-red-600 mt-1">{errors.customerEmail}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quotation Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Items</CardTitle>
                <Button onClick={addQuotationItem} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {quotationItems.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">Item {index + 1}</h4>
                    {quotationItems.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuotationItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label>Product *</Label>
                      <ProductSelector
                        key={`${item.id}-${item.productId}`}
                        products={products}
                        value={item.productId}
                        onValueChange={(value) => handleProductSelect(item.id, value)}
                        placeholder={
                          productsLoading
                            ? "Loading products..."
                            : productsError
                              ? "Failed to load products"
                              : products.length === 0
                                ? "No products available"
                                : "Search and select a product..."
                        }
                        error={!!errors[`item_${index}_product`] || !!productsError}
                        disabled={productsLoading || !!productsError}
                      />
                      {errors[`item_${index}_product`] && (
                        <p className="text-sm text-red-600 mt-1">{errors[`item_${index}_product`]}</p>
                      )}
                      {productsError && (
                        <div className="mt-1">
                          <p className="text-sm text-red-600">Failed to load products.</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => refetchProducts()}
                            className="mt-1"
                          >
                            Retry
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuotationItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className={errors[`item_${index}_quantity`] ? 'border-red-500' : ''}
                      />
                      {errors[`item_${index}_quantity`] && (
                        <p className="text-sm text-red-600 mt-1">{errors[`item_${index}_quantity`]}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateQuotationItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total: ${item.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              
              {errors.items && (
                <p className="text-sm text-red-600">{errors.items}</p>
              )}
            </CardContent>
          </Card>

          {/* Prescription Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Prescription (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="prescription">Upload Prescription File</Label>
                  <div className="mt-2">
                    <Input
                      id="prescription"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="mb-2"
                    />
                    <p className="text-sm text-gray-500">
                      Supported formats: PDF, JPG, PNG, GIF, WEBP (Max 5MB)
                    </p>
                    
                    {isUploading && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}
                    
                    {prescriptionFileUrl && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-800">File uploaded successfully</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any special requirements or notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Quotation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%):</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-4 pt-6">
          <Button variant="outline" onClick={onClose} disabled={loading} size="lg">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} size="lg">
            {loading ? 'Creating...' : 'Create Quotation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
