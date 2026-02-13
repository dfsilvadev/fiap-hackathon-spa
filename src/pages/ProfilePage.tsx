import { useEditProfile } from '../hooks/useEditProfile'

export const ProfilePage = () => {
  const {
    formData,
    loading,
    isSubmitting,
    updateField,
    updateGuardian,
    addGuardian,
    removeGuardian,
    saveProfile,
  } = useEditProfile()

  if (loading && !formData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f1f5f9]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium text-lg">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!formData) return null

  return (
    <main className="min-h-screen bg-[#f1f5f9] p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight text-center md:text-left">
            Editar Perfil
          </h1>
          <p className="text-slate-500 mt-2 text-lg text-center md:text-left">
            Mantenha suas informações e contatos de emergência atualizados.
          </p>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            saveProfile()
          }}
          className="space-y-10"
        >
          <section className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
              <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-800">Informações Pessoais</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 ml-1 italic">
                  Nome Completo
                </label>
                <input
                  value={formData.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 ml-1 italic">
                  Email Acadêmico
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 ml-1 italic">
                  Telefone de Contato
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 ml-1 italic">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none"
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-50 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-slate-800">Responsáveis Familiares</h2>
              </div>
              <button
                type="button"
                onClick={addGuardian}
                className="w-full md:w-auto bg-emerald-50 text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-emerald-100 transition-colors border border-emerald-100"
              >
                + Adicionar Responsável
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {formData.guardians?.map((guardian, index) => (
                <div
                  key={index}
                  className="p-6 md:p-8 border border-slate-100 rounded-3xl bg-slate-50/50 relative group"
                >
                  <button
                    type="button"
                    onClick={() => removeGuardian(index)}
                    className="absolute top-4 right-6 text-slate-400 hover:text-red-500 font-bold text-xs uppercase transition-colors"
                  >
                    Excluir
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Nome Completo
                      </p>
                      <input
                        value={guardian.name}
                        onChange={(e) => updateGuardian(index, 'name', e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Parentesco
                      </p>
                      <input
                        value={guardian.relationship}
                        onChange={(e) => updateGuardian(index, 'relationship', e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Telefone
                      </p>
                      <input
                        type="tel"
                        value={guardian.phone}
                        onChange={(e) => updateGuardian(index, 'phone', e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        E-mail
                      </p>
                      <input
                        type="email"
                        value={guardian.email}
                        onChange={(e) => updateGuardian(index, 'email', e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {formData.guardians?.length === 0 && (
                <p className="text-center py-8 text-slate-400 italic">
                  Nenhum responsável cadastrado.
                </p>
              )}
            </div>
          </section>

          <div className="flex justify-center md:justify-end gap-6 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-72 p-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:bg-slate-300 disabled:shadow-none"
            >
              {isSubmitting ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default ProfilePage
