// Serviços do Firebase Firestore
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// ===== PRODUTOS =====
export const productsService = {
  // Adicionar produto
  async addProduct(product) {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      throw error;
    }
  },

  // Buscar todos os produtos
  async getProducts() {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  },

  // Atualizar produto
  async updateProduct(id, product) {
    try {
      await updateDoc(doc(db, 'products', id), product);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },

  // Deletar produto
  async deleteProduct(id) {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  }
};

// ===== VENDAS =====
export const salesService = {
  // Adicionar venda
  async addSale(sale) {
    try {
      const docRef = await addDoc(collection(db, 'sales'), {
        ...sale,
        date: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar venda:', error);
      throw error;
    }
  },

  // Buscar vendas
  async getSales() {
    try {
      const q = query(collection(db, 'sales'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      throw error;
    }
  },

  // Buscar vendas do dia
  async getTodaySales() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const q = query(
        collection(db, 'sales'),
        where('date', '>=', today),
        where('date', '<', tomorrow)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar vendas do dia:', error);
      throw error;
    }
  }
};

// ===== COMPRAS =====
export const purchasesService = {
  // Adicionar compra
  async addPurchase(purchase) {
    try {
      const docRef = await addDoc(collection(db, 'purchases'), {
        ...purchase,
        date: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar compra:', error);
      throw error;
    }
  },

  // Buscar compras
  async getPurchases() {
    try {
      const q = query(collection(db, 'purchases'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar compras:', error);
      throw error;
    }
  }
};

// ===== FIADO =====
export const debtsService = {
  // Adicionar dívida
  async addDebt(debt) {
    try {
      const docRef = await addDoc(collection(db, 'debts'), {
        ...debt,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar dívida:', error);
      throw error;
    }
  },

  // Buscar dívidas
  async getDebts() {
    try {
      const q = query(collection(db, 'debts'), orderBy('dueDate', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar dívidas:', error);
      throw error;
    }
  },

  // Atualizar status da dívida
  async updateDebtStatus(id, status) {
    try {
      await updateDoc(doc(db, 'debts', id), { status });
    } catch (error) {
      console.error('Erro ao atualizar status da dívida:', error);
      throw error;
    }
  }
};

// ===== CONTAS A PAGAR =====
export const accountsPayableService = {
  // Adicionar conta a pagar
  async addAccount(account) {
    try {
      const docRef = await addDoc(collection(db, 'accountsPayable'), {
        ...account,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar conta a pagar:', error);
      throw error;
    }
  },

  // Buscar contas a pagar
  async getAccounts() {
    try {
      const q = query(collection(db, 'accountsPayable'), orderBy('dueDate', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar contas a pagar:', error);
      throw error;
    }
  },

  // Atualizar status da conta
  async updateAccountStatus(id, status) {
    try {
      await updateDoc(doc(db, 'accountsPayable', id), { status });
    } catch (error) {
      console.error('Erro ao atualizar status da conta:', error);
      throw error;
    }
  }
};

// ===== CONTAS A RECEBER =====
export const accountsReceivableService = {
  // Adicionar conta a receber
  async addAccount(account) {
    try {
      const docRef = await addDoc(collection(db, 'accountsReceivable'), {
        ...account,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar conta a receber:', error);
      throw error;
    }
  },

  // Buscar contas a receber
  async getAccounts() {
    try {
      const q = query(collection(db, 'accountsReceivable'), orderBy('dueDate', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar contas a receber:', error);
      throw error;
    }
  },

  // Atualizar status da conta
  async updateAccountStatus(id, status) {
    try {
      await updateDoc(doc(db, 'accountsReceivable', id), { status });
    } catch (error) {
      console.error('Erro ao atualizar status da conta:', error);
      throw error;
    }
  }
};

// ===== FLUXO DE CAIXA =====
export const cashFlowService = {
  // Adicionar movimentação
  async addMovement(movement) {
    try {
      const docRef = await addDoc(collection(db, 'cashFlow'), {
        ...movement,
        date: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar movimentação:', error);
      throw error;
    }
  },

  // Buscar movimentações
  async getMovements() {
    try {
      const q = query(collection(db, 'cashFlow'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      throw error;
    }
  },

  // Calcular saldo atual
  async getCurrentBalance() {
    try {
      const movements = await this.getMovements();
      return movements.reduce((balance, movement) => {
        return movement.type === 'entrada' 
          ? balance + movement.value 
          : balance - movement.value;
      }, 0);
    } catch (error) {
      console.error('Erro ao calcular saldo:', error);
      throw error;
    }
  }
};
