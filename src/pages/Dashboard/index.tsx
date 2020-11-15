import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    loadFoods();
  }, []);

  async function loadFoods(): Promise<void> {
    const { data } = await api.get(`foods`)
    setFoods(data)
  }

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const { data:foodData } = await api.post(`foods`, { ...food, available: true} )

      setFoods([ ...foods, foodData ])
      // loadFoods()
      toggleModal()
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {

    const { data } = await api.put(`foods/${editingFood.id}`, { ...food, available: editingFood.available })
    
    const otherFoods = foods.filter(f => f.id != editingFood.id)
    setFoods([ ...otherFoods, data ])
    toggleEditModal()
  }

  async function handleDeleteFood(id: number): Promise<void> {
    try {
      await api.delete(`foods/${id}`)
      const parsedFoods = foods.filter(f => f.id != id)

      setFoods(parsedFoods)
      // loadFoods()
    } catch (error) {
     console.error(`Erro ao deletar item: ${id}`) 
    }
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    toggleEditModal()
    setEditingFood(food)
  }

  return (
    <>
      <Header openModal={toggleModal} />

      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />      

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
