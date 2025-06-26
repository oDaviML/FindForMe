export async function checkUserCanCreateItem(userId) {
  try {
    const response = await fetch(
      `http://localhost:3000/items?reportedBy=${userId}&_sort=createdAt&_order=desc&_limit=1`
    );

    if (!response.ok) {
      throw new Error('Erro ao verificar cadastros recentes');
    }

    const items = await response.json();

    // Se não tiver itens cadastrados, pode cadastrar
    if (items.length === 0) {
      return { canCreate: true, message: '' };
    }

    const lastItemDate = new Date(items[0].createdAt);
    const currentDate = new Date();

    // Diferença em milissegundos
    const timeDiff = currentDate.getTime() - lastItemDate.getTime();

    // Converte para minutos
    const minutesDiff = timeDiff / (1000 * 60);

    // Verifica se passou menos de 5 minutos desde o último cadastro
    if (minutesDiff < 5) {
      const timeLeft = Math.ceil(5 - minutesDiff);
      return {
        canCreate: false,
        message: `Você precisa aguardar ${timeLeft} minuto(s) para cadastrar um novo item.`,
      };
    }

    return { canCreate: true, message: '' };
  } catch (error) {
    console.error('Erro na verificação de flood:', error);
    // Em caso de erro na verificação, permitimos o cadastro para não prejudicar a experiência
    return { canCreate: true, message: '' };
  }
}
