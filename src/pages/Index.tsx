import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogCard } from "@/components/LogCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { CreateLogModal } from "@/components/CreateLogModal";
import { useLogContext } from "@/contexts/LogContext";
import { FileText, Plus } from "lucide-react";

const Index = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { logs, addLog, deleteLog } = useLogContext();
  const navigate = useNavigate();

  const handleCreateLog = (logData: { title: string; description?: string }) => {
    addLog(logData);
  };

  const handleLogClick = (logId: string) => {
    navigate(`/log/${logId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-soft">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Memz</h1>
            <p className="text-lg text-muted-foreground">Your personal logging companion</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {logs.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-foreground">
                Your Logs ({logs.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {logs.map((log) => (
                <LogCard
                  key={log.id}
                  log={log}
                  onClick={() => handleLogClick(log.id)}
                  onDelete={() => deleteLog(log.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="mb-8">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                No logs yet
              </h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Create your first log to start tracking events and activities.
              </p>
            </div>
            
            <div className="bg-card/50 border border-border/50 rounded-lg p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-4">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Click the + button to create your first log
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setShowCreateModal(true)} />

      {/* Create Log Modal */}
      <CreateLogModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateLog={handleCreateLog}
      />
    </div>
  );
};

export default Index;
