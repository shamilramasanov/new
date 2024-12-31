export default function ContractSpecification({ contract, onUpdate }) {
    const [specifications, setSpecifications] = React.useState(contract.specifications || []);
    const [editingSpec, setEditingSpec] = React.useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
    const onAddSpecification = (data) => {
      const newSpec = {
        id: Date.now().toString(),
        contractId: contract.id,
        itemName: data.itemName,
        code: data.code,
        quantity: parseFloat(data.quantity),
        unit: data.unit,
        pricePerUnit: parseFloat(data.pricePerUnit),
        totalPrice: parseFloat(data.quantity) * parseFloat(data.pricePerUnit),
        remaining: parseFloat(data.quantity),
        usageHistory: []
      };
  
      setSpecifications([...specifications, newSpec]);
      onUpdate({
        ...contract,
        specifications: [...specifications, newSpec]
      });
      reset();
      toast.success('Специфікацію додано');
    };
  
    const onAddUsage = (specId, usageData) => {
      const spec = specifications.find(s => s.id === specId);
      if (!spec) return;
  
      const usage = {
        id: Date.now().toString(),
        date: new Date(),
        quantityUsed: parseFloat(usageData.quantityUsed),
        description: usageData.description,
        documentNumber: usageData.documentNumber
      };
  
      if (usage.quantityUsed > spec.remaining) {
        toast.error('Кількість перевищує доступний залишок');
        return;
      }
  
      const updatedSpec = {
        ...spec,
        remaining: spec.remaining - usage.quantityUsed,
        usageHistory: [...spec.usageHistory, usage]
      };
  
      const updatedSpecs = specifications.map(s => 
        s.id === specId ? updatedSpec : s
      );
  
      setSpecifications(updatedSpecs);
      onUpdate({
        ...contract,
        specifications: updatedSpecs
      });
      toast.success('Використання додано');
    };
  
    // Форма додавання специфікації
    const AddSpecificationForm = () => (
      <Dialog>
        <DialogTrigger asChild>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            <Plus className="h-4 w-4" />
            Додати позицію
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Нова позиція специфікації</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onAddSpecification)} className="space-y-4">
            {/* Поля форми */}
          </form>
        </DialogContent>
      </Dialog>
    );
  
    // Форма додавання використання
    const AddUsageForm = ({ spec }) => (
      <Dialog>
        <DialogTrigger asChild>
          <button
            className="text-blue-600 hover:text-blue-900 mx-2"
            title="Додати використання"
          >
            <FileText className="h-4 w-4" />
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Додати використання</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((data) => onAddUsage(spec.id, data))} className="space-y-4">
            {/* Поля форми */}
          </form>
        </DialogContent>
      </Dialog>
    );
  
    // **ОСТАННЄ RETURN**: головний компонент
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Специфікація контракту</h2>
        <AddSpecificationForm />
        <div className="space-y-4 mt-4">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Назва</th>
                <th className="px-4 py-2 text-left">Код</th>
                <th className="px-4 py-2 text-left">Од. виміру</th>
                <th className="px-4 py-2 text-right">Кількість</th>
                <th className="px-4 py-2 text-right">Ціна</th>
                <th className="px-4 py-2 text-right">Сума</th>
              </tr>
            </thead>
            <tbody>
              {specifications.map((spec, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{spec.itemName}</td>
                  <td className="border px-4 py-2">{spec.code}</td>
                  <td className="border px-4 py-2">{spec.unit}</td>
                  <td className="border px-4 py-2 text-right">{spec.quantity}</td>
                  <td className="border px-4 py-2 text-right">{spec.pricePerUnit.toFixed(2)}</td>
                  <td className="border px-4 py-2 text-right">{spec.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  } // <-- Закриваюча дужка для головного компонента