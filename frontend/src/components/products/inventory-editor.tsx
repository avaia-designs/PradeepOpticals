'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Edit,
  Save,
  X,
  Package,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { ProductService } from '@/lib/services/product.service';
import { Product } from '@/types';
import { toast } from 'sonner';

interface InventoryEditorProps {
  product: Product;
  onUpdate: (updatedProduct: Product) => void;
  disabled?: boolean;
}

export function InventoryEditor({ product, onUpdate, disabled = false }: InventoryEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newQuantity, setNewQuantity] = useState(product.inventory.toString());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleStartEdit = () => {
    setNewQuantity(product.inventory.toString());
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setNewQuantity(product.inventory.toString());
    setIsEditing(false);
  };

  const handleSave = async () => {
    const quantity = parseInt(newQuantity);
    
    if (isNaN(quantity) || quantity < 0) {
      toast.error('Please enter a valid quantity (0 or greater)');
      return;
    }

    if (quantity === product.inventory) {
      setIsEditing(false);
      return;
    }

    try {
      setIsUpdating(true);
      const updatedProduct = await ProductService.updateInventory(product._id, quantity);
      onUpdate(updatedProduct);
      setIsEditing(false);
      toast.success('Inventory updated successfully');
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast.error('Failed to update inventory');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickUpdate = (delta: number) => {
    const newValue = Math.max(0, product.inventory + delta);
    setNewQuantity(newValue.toString());
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return { 
        badge: <Badge variant="destructive">Out of Stock</Badge>,
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
        color: 'text-red-600'
      };
    }
    if (quantity < 10) {
      return { 
        badge: <Badge variant="outline" className="text-orange-600 border-orange-600">Low Stock</Badge>,
        icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
        color: 'text-orange-600'
      };
    }
    return { 
      badge: <Badge variant="default">In Stock</Badge>,
      icon: <Package className="h-4 w-4 text-green-500" />,
      color: 'text-green-600'
    };
  };

  const stockStatus = getStockStatus(product.inventory);

  if (disabled) {
    return (
      <div className="flex items-center space-x-2">
        {stockStatus.icon}
        <span className="font-medium">{product.inventory}</span>
        {stockStatus.badge}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickUpdate(-1)}
            disabled={isUpdating}
            className="h-8 w-8 p-0"
          >
            -
          </Button>
          <Input
            type="number"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            className="w-20 h-8 text-center"
            min="0"
            disabled={isUpdating}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickUpdate(1)}
            disabled={isUpdating}
            className="h-8 w-8 p-0"
          >
            +
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isUpdating}
            className="h-8 px-2"
          >
            <Save className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancelEdit}
            disabled={isUpdating}
            className="h-8 px-2"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {stockStatus.icon}
      <span className="font-medium">{product.inventory}</span>
      {stockStatus.badge}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleStartEdit}
        disabled={disabled}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit className="h-3 w-3" />
      </Button>
    </div>
  );
}

interface BulkInventoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdate: (updatedProducts: Product[]) => void;
}

export function BulkInventoryDialog({ isOpen, onClose, products, onUpdate }: BulkInventoryDialogProps) {
  const [updates, setUpdates] = useState<Record<string, number>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = (productId: string, quantity: string) => {
    const value = parseInt(quantity);
    if (!isNaN(value) && value >= 0) {
      setUpdates(prev => ({ ...prev, [productId]: value }));
    }
  };

  const handleApplyUpdates = async () => {
    try {
      setIsUpdating(true);
      const updatePromises = Object.entries(updates).map(([productId, quantity]) =>
        ProductService.updateInventory(productId, quantity)
      );
      
      const updatedProducts = await Promise.all(updatePromises);
      onUpdate(updatedProducts);
      setUpdates({});
      onClose();
      toast.success('Inventory updated successfully');
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast.error('Failed to update inventory');
    } finally {
      setIsUpdating(false);
    }
  };

  const hasChanges = Object.keys(updates).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Inventory Update</DialogTitle>
          <DialogDescription>
            Update inventory quantities for multiple products at once.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-96 overflow-y-auto space-y-4">
          {products.map((product) => (
            <div key={product._id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <Package className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Current: {product.inventory}</span>
                <Input
                  type="number"
                  placeholder="New quantity"
                  min="0"
                  value={updates[product._id]?.toString() || ''}
                  onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                  className="w-24"
                />
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button 
            onClick={handleApplyUpdates} 
            disabled={!hasChanges || isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Apply Updates'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
