import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AdminLayout from '../components/Layout/AdminLayout.jsx';
import api from '../lib/api.js';

const PIPELINE_STAGES = [
  { id: 'pending', label: 'Digital Proofing' },
  { id: 'confirmed', label: 'In Print' },
  { id: 'processing', label: 'Binding' },
  { id: 'shipped', label: 'Quality Check' },
  { id: 'delivered', label: 'Ready to Ship' }
];

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { limit: 50 }; 
    if (search) params.search = search;

    const timeout = setTimeout(() => {
      api
        .get('/orders', { params })
        .then((res) => {
          setOrders(res.data.orders);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const onDragEnd = useCallback((result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Find the order being moved
    const movedOrder = orders.find(o => o.id === draggableId);
    if (!movedOrder) return;

    const originalStatus = movedOrder.status;
    const newStatus = destination.droppableId;

    // Optimistically update local state
    setOrders(prev => prev.map(o => 
      o.id === draggableId ? { ...o, status: newStatus } : o
    ));

    // Persist to backend
    api.patch(`/orders/${draggableId}`, { status: newStatus })
      .catch((err) => {
        console.error('Failed to update order status', err);
        // Revert on failure (with optional toast if you had a toast provider)
        setOrders(prev => prev.map(o => 
          o.id === draggableId ? { ...o, status: originalStatus } : o
        ));
      });
  }, [orders]);

  const getOrdersForStage = (stageId) => {
    return orders.filter(o => o.status === stageId);
  };

  return (
    <AdminLayout title="The Print Room" subtitle="Manufacturing pipeline & order routing">
      <div className="mb-10 flex items-center justify-between border-b border-border pb-4">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="w-full bg-transparent pl-8 py-2 text-sm font-functional text-ink placeholder:text-muted focus:outline-none"
            placeholder="Search manifest by order number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex h-[calc(100vh-280px)] gap-6 overflow-x-auto pb-6">
          {PIPELINE_STAGES.map((stage) => {
            const stageOrders = getOrdersForStage(stage.id);
            return (
              <div key={stage.id} className="flex h-full min-w-[320px] flex-col rounded-sm bg-white border border-border shadow-paper">
                <div className="border-b border-border bg-cream/50 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-editorial text-lg text-ink">{stage.label}</h3>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] text-white">
                      {stageOrders.length}
                    </span>
                  </div>
                </div>
                
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto p-4 space-y-4 transition-colors ${snapshot.isDraggingOver ? 'bg-cream/50' : 'bg-cream/30'}`}
                    >
                      {loading ? (
                         <div className="flex justify-center p-4">
                           <div className="h-6 w-6 animate-spin rounded-full border-y border-ink" />
                         </div>
                      ) : (
                        stageOrders.map((o, index) => (
                          <Draggable key={o.id} draggableId={o.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{ ...provided.draggableProps.style }}
                              >
                                <motion.div
                                  layout
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
                                  onClick={() => navigate(`/orders/${o.id}`)}
                                  className={`cursor-grab active:cursor-grabbing rounded-sm border border-border bg-white p-4 transition-shadow ${snapshot.isDragging ? 'shadow-lg ring-1 ring-brand-500' : 'shadow-sm'}`}
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="font-functional text-[10px] uppercase tracking-widest text-muted">
                                      {o.order_number}
                                    </span>
                                    <span className="font-editorial font-bold text-ink text-sm">
                                      {formatCurrency(o.total)}
                                    </span>
                                  </div>
                                  <p className="font-editorial text-lg text-ink leading-tight mb-1">
                                    {o.customers?.full_name || 'Guest User'}
                                  </p>
                                  <p className="font-functional text-xs text-muted">
                                    Placed {new Date(o.placed_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                  </p>
                                </motion.div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                      
                      {!loading && stageOrders.length === 0 && (
                        <div className="flex h-32 items-center justify-center border border-dashed border-border text-center">
                          <p className="font-functional text-xs uppercase tracking-widest text-muted">Empty Queue</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </AdminLayout>
  );
}
